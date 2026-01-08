
import React from 'react';
import { LevelSystem, LevelOption } from '../types';

interface LevelSelectorProps {
  value: LevelOption;
  onChange: (value: LevelOption) => void;
}

const systems: Record<LevelSystem, string[]> = {
  [LevelSystem.GLOBAL_SUCCESS]: ['Grade 10', 'Grade 11', 'Grade 12', 'High School Final Exam'],
  [LevelSystem.CEFR]: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  [LevelSystem.IELTS]: ['4.0', '5.0', '6.0', '7.0', '8.0', '9.0'],
  [LevelSystem.TOEFL]: ['0-31', '32-59', '60-78', '79-101', '102-120'],
  [LevelSystem.TOEIC]: ['10-180', '185-250', '255-400', '405-600', '605-780', '785-990']
};

const LevelSelector: React.FC<LevelSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-2 w-full max-w-xs">
      <div className="w-1/2">
        <select
          value={value.system}
          onChange={(e) => {
            const newSystem = e.target.value as LevelSystem;
            onChange({ system: newSystem, subLevel: systems[newSystem][0] });
          }}
          className="block w-full pl-3 pr-8 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm shadow-sm"
        >
          {Object.values(LevelSystem).map((sys) => (
            <option key={sys} value={sys}>{sys}</option>
          ))}
        </select>
      </div>
      <div className="w-1/2">
        <select
          value={value.subLevel}
          onChange={(e) => onChange({ ...value, subLevel: e.target.value })}
          className="block w-full pl-3 pr-8 py-2 border border-mono-300 rounded-md leading-5 bg-white text-mono-900 focus:outline-none focus:ring-1 focus:ring-mono-900 focus:border-mono-900 sm:text-sm shadow-sm"
        >
          {systems[value.system].map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LevelSelector;
