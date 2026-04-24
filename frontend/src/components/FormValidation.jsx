import React, { useState, useCallback } from 'react';

// Validation rules
const validators = {
  required: (value) => (!value || (typeof value === 'string' && !value.trim()) ? 'This field is required' : null),
  email: (value) => (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : null),
  minLength: (min) => (value) => (value && value.length < min ? `Must be at least ${min} characters` : null),
  maxLength: (max) => (value) => (value && value.length > max ? `Must be no more than ${max} characters` : null),
  min: (minVal) => (value) => (value !== '' && Number(value) < minVal ? `Must be at least ${minVal}` : null),
  max: (maxVal) => (value) => (value !== '' && Number(value) > maxVal ? `Must be no more than ${maxVal}` : null),
  phone: (value) => (value && !/^[\d\s\-+()]{7,20}$/.test(value) ? 'Invalid phone number' : null),
  url: (value) => (value && !/^https?:\/\/.+\..+/.test(value) ? 'Invalid URL' : null),
  password: (value) => {
    if (!value) return null;
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain a number';
    return null;
  },
  match: (fieldName, getValue) => (value) => (value !== getValue() ? `Must match ${fieldName}` : null),
};

// Custom hook for form validation
export const useFormValidation = (initialValues, rules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const fieldRules = rules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = typeof rule === 'function' ? rule(value) : null;
      if (error) return error;
    }
    return null;
  }, [rules]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    for (const [name, fieldRules] of Object.entries(rules)) {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  }, [rules, values, validateField]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const reset = useCallback((newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, validateAll, reset, setValues };
};

// Validated input wrapper
export const ValidatedInput = ({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  onChange,
  onBlur,
  required,
  placeholder,
  className = '',
  ...props
}) => {
  const showError = touched && error;

  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          className={`input ${showError ? 'border-red-500 focus:ring-red-500' : ''}`}
          rows={3}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          className={`input ${showError ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...props}
        >
          {props.children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          className={`input ${showError ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...props}
        />
      )}
      {showError && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export { validators };
