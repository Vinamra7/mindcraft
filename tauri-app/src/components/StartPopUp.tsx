import React from "react";
import { useNavigate } from "react-router-dom";

interface StartPopUpProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    version: string;
    port: number;
    selectedProfiles: string[];
}

const StartPopUp: React.FC<StartPopUpProps> = ({ isOpen, onClose, onStart, version, port, selectedProfiles }) => {
    
    const navigate = useNavigate();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
                <p className="mb-2">
                    Minecraft version: <span className="font-semibold">{version}</span>
                </p>
                <p className="mb-2">
                    Port: <span className="font-semibold">{port}</span>
                </p>
                <p className="mb-4">
                    Active Profiles: {' '}
                    <span className="font-semibold">
                        {selectedProfiles.map((profile) => profile).join(', ')}
                    </span>
                </p>
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => navigate('/advanced-settings')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onStart}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                    >
                        Start
                    </button>
                </div>
            </div>
        </div>
    )
};
export default StartPopUp;