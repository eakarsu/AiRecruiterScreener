import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewsApi } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Sparkles,
  ExternalLink,
  Star,
} from 'lucide-react';

const statusColors = {
  scheduled: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-red',
  no_show: 'badge-yellow',
};

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [feedback, setFeedback] = useState({
    notes: '',
    overallRating: 0,
    technicalScore: 50,
    culturalScore: 50,
    feedback: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      const response = await interviewsApi.getById(id);
      setInterview(response.data);
      if (response.data.notes) {
        setFeedback((prev) => ({ ...prev, notes: response.data.notes }));
      }
    } catch (error) {
      console.error('Failed to fetch interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const response = await interviewsApi.generateQuestions(id, { interviewType: interview.type });
      setInterview((prev) => ({
        ...prev,
        aiQuestions: JSON.stringify(response.data.questions),
      }));
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('Failed to generate questions');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    try {
      await interviewsApi.submitFeedback(id, feedback);
      fetchInterview();
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Interview not found</p>
        <button onClick={() => navigate('/interviews')} className="btn-primary mt-4">
          Back to Interviews
        </button>
      </div>
    );
  }

  const aiQuestions = interview.aiQuestions ? JSON.parse(interview.aiQuestions) : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/interviews')} className="p-2 hover:bg-gray-100 rounded-lg mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{interview.type} Interview</h1>
            <span className={statusColors[interview.status]}>{interview.status}</span>
          </div>
          <p className="text-gray-500">
            with {interview.candidate?.firstName} {interview.candidate?.lastName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(interview.scheduledAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">
                    {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' '}({interview.duration} min)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Interviewer</p>
                  <p className="font-medium">
                    {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                  </p>
                </div>
              </div>
              {interview.meetingLink && (
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Meeting Link</p>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline flex items-center gap-1"
                    >
                      Join Meeting <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Questions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Interview Questions</h2>
              <button
                onClick={handleGenerateQuestions}
                disabled={generatingQuestions}
                className="btn-secondary flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {generatingQuestions ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>

            {aiQuestions.length > 0 ? (
              <div className="space-y-4">
                {aiQuestions.map((q, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-900">{index + 1}. {q.question}</p>
                      <div className="flex gap-2">
                        <span className="badge-blue text-xs capitalize">{q.category}</span>
                        <span className="badge-gray text-xs capitalize">{q.difficulty}</span>
                      </div>
                    </div>
                    {q.followUp && (
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Follow-up:</span> {q.followUp}
                      </p>
                    )}
                    {q.idealAnswer && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Look for:</span> {q.idealAnswer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No questions generated yet. Click "Generate with AI" to create tailored interview questions.
              </p>
            )}
          </div>

          {/* Feedback Form */}
          {interview.status === 'scheduled' || interview.status === 'completed' ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Feedback</h2>

              <div className="space-y-4">
                <div>
                  <label className="label">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, overallRating: rating })}
                        className={`p-2 rounded-lg transition-colors ${
                          feedback.overallRating >= rating
                            ? 'text-yellow-500'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Technical Score: {feedback.technicalScore}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={feedback.technicalScore}
                      onChange={(e) => setFeedback({ ...feedback, technicalScore: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Cultural Fit Score: {feedback.culturalScore}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={feedback.culturalScore}
                      onChange={(e) => setFeedback({ ...feedback, culturalScore: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Interview Notes</label>
                  <textarea
                    className="input min-h-[120px]"
                    value={feedback.notes}
                    onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
                    placeholder="Document key points from the interview..."
                  />
                </div>

                <div>
                  <label className="label">Final Feedback</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={feedback.feedback}
                    onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                    placeholder="Your overall assessment and recommendation..."
                  />
                </div>

                <button
                  onClick={handleSubmitFeedback}
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Candidate</h3>
            <div
              onClick={() => navigate(`/candidates/${interview.candidate?.id}`)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-700">
                  {interview.candidate?.firstName?.[0]}{interview.candidate?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {interview.candidate?.firstName} {interview.candidate?.lastName}
                </p>
                <p className="text-sm text-gray-500">{interview.candidate?.email}</p>
              </div>
            </div>
          </div>

          {/* Job Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Position</h3>
            <div
              onClick={() => navigate(`/jobs/${interview.candidate?.jobPosting?.id}`)}
              className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <p className="font-medium text-gray-900">{interview.candidate?.jobPosting?.title}</p>
              <p className="text-sm text-gray-500">{interview.candidate?.jobPosting?.department}</p>
            </div>
          </div>

          {/* Interview Scores (if completed) */}
          {interview.status === 'completed' && (interview.overallRating || interview.technicalScore) && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Scores</h3>
              <div className="space-y-3">
                {interview.overallRating && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overall Rating</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= interview.overallRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {interview.technicalScore !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Technical Score</span>
                    <span className="font-semibold">{interview.technicalScore}%</span>
                  </div>
                )}
                {interview.culturalScore !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cultural Fit</span>
                    <span className="font-semibold">{interview.culturalScore}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;
