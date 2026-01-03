import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { useDarkMode } from "@/context/ThemeContext";

export default function EventModal({ isOpen, onClose, selectedDate, event, onSave, onDelete }) {
    const { isDark } = useDarkMode();
    const [formData, setFormData] = useState({
        title: "",
        type: "other",
        description: "",
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                type: event.type,
                description: event.description || "",
            });
        } else {
            setFormData({
                title: "",
                type: "other",
                description: "",
            });
        }
    }, [event, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={event ? "Edit Event" : `Add Event - ${selectedDate}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                    >
                        <option value="holiday">Holiday</option>
                        <option value="exam">Exam (General)</option>
                        <option value="midterm">Mid-term Exam</option>
                        <option value="final">Final Exam</option>
                        <option value="quiz">Quiz</option>
                        <option value="meeting">Meeting</option>
                        <option value="activity">School Activity</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formData.type === 'holiday' ? 'Holiday Name' :
                            formData.type === 'meeting' ? 'Meeting Title' :
                                formData.type === 'exam' ? 'Exam Subject' :
                                    'Title'} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder={formData.type === 'holiday' ? "e.g., Eid al-Fitr" : "e.g., Mid-term Exam"}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                    />
                </div>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                    />
                </div>

                <div className="flex justify-between mt-6">
                    {event && onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(event.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
