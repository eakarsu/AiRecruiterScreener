import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewSchedulerApi, candidatesApi } from '../services/api';
import { useModal } from '../components/Modal';
import {
  Calendar,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Sparkles,
  Loader,
  Clock,
  Video,
  MapPin,
  Users,
  CheckCircle,
} from 'lucide-react';

const InterviewScheduler = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [formData, setFormData] = useState({
    candidateId: '',
    interviewers: [],
    duration: 60,
    type: 'video',
    availableSlots: '',
  });
  const { confirmDanger } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, candidatesRes] = await Promise.all([
        interviewSchedulerApi.getAll(),
        candidatesApi.getAll(),
      ]);
      setSchedules(schedulesRes.data);
      setCandidates(candidatesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      const slots = formData.availableSlots.split('\n').filter(s => s.trim());
      const res = await interviewSchedulerApi.create({
        candidateId: formData.candidateId,
        interviewers: formData.interviewers,
        duration: formData.duration,
        type: formData.type,
        availableSlots: slots,
      });
      setSchedules([res.data.schedule, ...schedules]);
      setShowModal(false);
      setSelectedSchedule(res.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to schedule:', error);
    } finally {
      setScheduling(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDanger('Delete Schedule', 'Are you sure you want to delete this interview schedule?');
    if (!confirmed) return;
    try {
      await interviewSchedulerApi.delete(id);
      setSchedules(schedules.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Clock;
      case 'onsite': return MapPin;
      default: return Users;
    }
  };

  const parseSuggestions = (schedule) => {
    try {
      return JSON.parse(schedule.aiSuggestions);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/hr')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              AI Interview Scheduler
            </h1>
            <p className="text-gray-500 mt-1">Smart scheduling with AI recommendations</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Schedules List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Interview Schedules</h2>
        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No interview schedules yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => {
              const TypeIcon = getTypeIcon(schedule.type);
              return (
                <div
                  key={schedule.id}
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setShowDetailModal(true);
                  }}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        <TypeIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {schedule.candidate?.firstName} {schedule.candidate?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {schedule.type} | {schedule.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {schedule.selectedSlot && (
                        <span className="text-sm font-medium text-green-600">
                          {new Date(schedule.selectedSlot).toLocaleString()}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        schedule.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {schedule.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(schedule.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Schedule Interview</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-500 mb-2 block">Load Sample Data</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: 'Video Interview',
                      data: { type: 'video', duration: 60, availableSlots: '2026-03-15 10:00 AM\n2026-03-15 2:00 PM\n2026-03-16 11:00 AM' },
                    },
                    {
                      label: 'On-site Panel',
                      data: { type: 'panel', duration: 90, availableSlots: '2026-03-18 9:00 AM\n2026-03-19 10:00 AM\n2026-03-20 1:00 PM' },
                    },
                    {
                      label: 'Phone Screen',
                      data: { type: 'phone', duration: 30, availableSlots: '2026-03-14 3:00 PM\n2026-03-15 9:00 AM\n2026-03-15 4:00 PM' },
                    },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, ...sample.data }))}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 rounded-full text-gray-700 transition-colors"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Candidate</label>
                <select
                  value={formData.candidateId}
                  onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Interview Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone</option>
                    <option value="onsite">On-site</option>
                    <option value="panel">Panel</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration (minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Available Time Slots (one per line)</label>
                <textarea
                  value={formData.availableSlots}
                  onChange={(e) => setFormData({ ...formData, availableSlots: e.target.value })}
                  className="input"
                  rows={4}
                  placeholder="2024-03-15 10:00 AM&#10;2024-03-15 2:00 PM&#10;2024-03-16 11:00 AM"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={scheduling} className="btn-primary flex items-center gap-2">
                  {scheduling ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {scheduling ? 'Getting AI Suggestions...' : 'Get AI Suggestions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Interview Scheduling - AI Recommendations</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const schedule = selectedSchedule.schedule || selectedSchedule;
              const suggestions = selectedSchedule.suggestions || parseSuggestions(schedule);

              return (
                <div className="space-y-6">
                  {/* Candidate Info */}
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
                        {schedule.candidate?.firstName?.[0]}{schedule.candidate?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {schedule.candidate?.firstName} {schedule.candidate?.lastName}
                        </p>
                        <p className="text-gray-600">{schedule.type} Interview | {schedule.duration} minutes</p>
                      </div>
                    </div>
                  </div>

                  {suggestions && (
                    <>
                      {/* Recommended Slots */}
                      {suggestions.recommendedSlots && suggestions.recommendedSlots.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            AI Recommended Time Slots
                          </h3>
                          <div className="space-y-3">
                            {suggestions.recommendedSlots.map((slot, idx) => (
                              <div key={idx} className={`p-4 border rounded-lg ${
                                slot.rank === 1 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      slot.rank === 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
                                    }`}>
                                      #{slot.rank}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {new Date(slot.dateTime).toLocaleString()}
                                      </p>
                                      <p className="text-sm text-gray-500">{slot.reasoning}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">{slot.score}%</p>
                                    <p className="text-xs text-gray-500">optimal</p>
                                  </div>
                                </div>
                                {slot.considerations && slot.considerations.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {slot.considerations.map((c, i) => (
                                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conflicts */}
                      {suggestions.conflicts && suggestions.conflicts.length > 0 && (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h3 className="font-semibold mb-2 text-yellow-700">Potential Conflicts</h3>
                          <div className="space-y-2">
                            {suggestions.conflicts.map((conflict, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-yellow-600">•</span>
                                <div>
                                  <p className="text-yellow-700">{conflict.description}</p>
                                  <p className="text-sm text-yellow-600">Resolution: {conflict.resolution}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Logistics */}
                      {suggestions.logistics && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h3 className="font-semibold mb-3 text-blue-700">Interview Logistics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Format</p>
                              <p className="font-medium capitalize">{suggestions.logistics.format}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Platform</p>
                              <p className="font-medium">{suggestions.logistics.platform}</p>
                            </div>
                          </div>
                          {suggestions.logistics.preparations && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-1">Preparations</p>
                              <ul className="space-y-1">
                                {suggestions.logistics.preparations.map((prep, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span>{prep}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Candidate Experience Tips */}
                      {suggestions.candidateExperience && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h3 className="font-semibold mb-2 text-purple-700">Candidate Experience Tips</h3>
                          {suggestions.candidateExperience.tips && (
                            <ul className="space-y-1">
                              {suggestions.candidateExperience.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-purple-600">
                                  <span>•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Summary */}
                      {suggestions.summary && (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                          <h3 className="font-semibold mb-2">Summary</h3>
                          <p className="text-gray-700">{suggestions.summary}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;
