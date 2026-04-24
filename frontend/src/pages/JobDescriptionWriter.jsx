import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi, biasDetectorApi } from '../services/api';
import {
  FileText,
  ArrowLeft,
  Sparkles,
  Loader,
  CheckCircle,
  Copy,
  Shield,
  AlertTriangle,
  Trash2,
  Eye,
  X,
} from 'lucide-react';

const JobDescriptionWriter = () => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [checkingBias, setCheckingBias] = useState(false);
  const [result, setResult] = useState(null);
  const [biasResult, setBiasResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    notes: '',
  });

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await jobsApi.getAll({ status: 'draft' });
      setSavedJobs(res.data.filter(j => j.aiGenerated));
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setBiasResult(null);
    try {
      const res = await jobsApi.generateDescription(formData);
      const data = res.data;
      setResult(data.generated || data);
      if (data.job) {
        setSavedJobs(prev => [data.job, ...prev]);
      }
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await jobsApi.delete(id);
      setSavedJobs(prev => prev.filter(j => j.id !== id));
      if (selectedJob?.id === id) setSelectedJob(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleCheckBias = async () => {
    if (!result) return;
    setCheckingBias(true);
    try {
      const fullDescription = `
${result.title}

${result.summary}

Responsibilities:
${result.responsibilities?.join('\n')}

Requirements:
${result.requirements?.join('\n')}

Nice to Have:
${result.niceToHave?.join('\n')}

Benefits:
${result.benefits?.join('\n')}
      `;
      const res = await biasDetectorApi.analyze({
        content: fullDescription,
        targetType: 'job_description',
      });
      setBiasResult(res.data.analysis);
    } catch (error) {
      console.error('Failed to check bias:', error);
    } finally {
      setCheckingBias(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `
${result.title}

${result.summary}

Responsibilities:
${result.responsibilities?.map(r => `• ${r}`).join('\n')}

Requirements:
${result.requirements?.map(r => `• ${r}`).join('\n')}

Nice to Have:
${result.niceToHave?.map(r => `• ${r}`).join('\n')}

Benefits:
${result.benefits?.map(b => `• ${b}`).join('\n')}

Salary Range: $${result.salaryRange?.min?.toLocaleString()} - $${result.salaryRange?.max?.toLocaleString()}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewSavedJob = (job) => {
    setSelectedJob(job);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/hr')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            AI Job Description Writer
          </h1>
          <p className="text-gray-500 mt-1">Generate inclusive, compelling job descriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Job Details</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: 'Senior Engineer',
                    data: { title: 'Senior Software Engineer', department: 'Engineering', location: 'Remote', type: 'full-time', notes: 'Focus on backend systems, microservices architecture. Team of 8 engineers. Must have experience with cloud platforms.' },
                  },
                  {
                    label: 'Product Manager',
                    data: { title: 'Product Manager', department: 'Product', location: 'New York, NY', type: 'full-time', notes: 'B2B SaaS product. Will own the roadmap for our analytics platform. Cross-functional role working with engineering, design, and sales.' },
                  },
                  {
                    label: 'UX Designer',
                    data: { title: 'UX/UI Designer', department: 'Design', location: 'San Francisco, CA', type: 'full-time', notes: 'Mobile-first design for consumer app. Portfolio required. Experience with design systems and user research preferred.' },
                  },
                ].map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setFormData(sample.data)}
                    className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 rounded-full text-gray-700 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input"
                  placeholder="e.g., Engineering"
                  required
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                  placeholder="e.g., Remote, San Francisco"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Employment Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="label">Additional Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={3}
                placeholder="Any specific requirements, skills, or details to include..."
              />
            </div>
            <button
              type="submit"
              disabled={generating}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating & Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate & Save Job Description
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Generated Description</h2>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckBias}
                  disabled={checkingBias}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 flex items-center gap-1"
                >
                  {checkingBias ? <Loader className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                  Check Bias
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center gap-1"
                >
                  {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {!result ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Fill in the job details and click generate</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bias Alert */}
              {biasResult && (
                <div className={`p-4 rounded-lg border ${
                  biasResult.biasScore <= 20 ? 'bg-green-50 border-green-200' :
                  biasResult.biasScore <= 50 ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Bias Check Results
                    </h4>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      biasResult.biasScore <= 20 ? 'bg-green-100 text-green-700' :
                      biasResult.biasScore <= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Bias Score: {biasResult.biasScore}%
                    </span>
                  </div>
                  <p className="text-sm">{biasResult.overallAssessment}</p>
                  {biasResult.problematicPhrases && biasResult.problematicPhrases.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Suggestions:</p>
                      {biasResult.problematicPhrases.slice(0, 3).map((p, idx) => (
                        <div key={idx} className="text-xs mt-1">
                          <span className="line-through text-red-600">{p.original}</span>
                          {' → '}
                          <span className="text-green-600">{p.suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title & Summary */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{result.title}</h3>
                <p className="text-gray-600 mt-2">{result.summary}</p>
              </div>

              {/* Salary Range */}
              {result.salaryRange && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Suggested Salary Range</p>
                  <p className="font-semibold text-green-700">
                    ${result.salaryRange.min?.toLocaleString()} - ${result.salaryRange.max?.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Responsibilities */}
              {result.responsibilities && (
                <div>
                  <h4 className="font-semibold mb-2">Responsibilities</h4>
                  <ul className="space-y-1">
                    {result.responsibilities.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {result.requirements && (
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {result.requirements.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nice to Have */}
              {result.niceToHave && (
                <div>
                  <h4 className="font-semibold mb-2">Nice to Have</h4>
                  <ul className="space-y-1">
                    {result.niceToHave.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-gray-400">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {result.benefits && (
                <div>
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.benefits.map((b, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm text-green-700 font-medium">Saved as draft job posting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Generated Descriptions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Previously Generated Descriptions ({savedJobs.length})</h2>
        {loadingSaved ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No saved descriptions yet. Generate one above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-gray-500">Title</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Department</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Location</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Type</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Salary Range</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Created</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => viewSavedJob(job)}
                  >
                    <td className="py-3 font-medium">{job.title}</td>
                    <td className="py-3 text-sm text-gray-600">{job.department}</td>
                    <td className="py-3 text-sm text-gray-600">{job.location}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{job.type}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {job.salaryMin && job.salaryMax
                        ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); viewSavedJob(job); }}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Saved Job Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedJob.title}</h2>
              <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium">{selectedJob.department}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{selectedJob.location}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedJob.type}</p>
                </div>
              </div>
              {selectedJob.salaryMin && selectedJob.salaryMax && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Salary Range</p>
                  <p className="font-semibold text-green-700">
                    ${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()}
                  </p>
                </div>
              )}
              {selectedJob.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.requirements && (
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {selectedJob.requirements.split('\n').filter(r => r.trim()).map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedJob.benefits && (
                <div>
                  <h4 className="font-semibold mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.split('\n').filter(b => b.trim()).map((b, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionWriter;
