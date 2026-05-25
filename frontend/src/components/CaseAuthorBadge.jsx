import React from 'react';
import { User } from 'lucide-react';

const CaseAuthorBadge = ({ authorName, profileImage, compact = false, className = '' }) => {
  const sizeClassName = compact ? 'h-9 w-9 rounded-md' : 'h-11 w-11 rounded-xl';
  const labelClassName = compact ? 'text-sm text-slate-300' : 'text-sm text-slate-600';

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      {profileImage ? (
        <img
          src={profileImage}
          alt={`${authorName || 'Anonymous'} profile`}
          className={`${sizeClassName} shrink-0 object-cover`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={`inline-flex ${sizeClassName} shrink-0 items-center justify-center bg-amber-400/10 text-amber-200`}>
          <User size={compact ? 15 : 18} />
        </span>
      )}
      <span className={`min-w-0 flex-1 truncate ${labelClassName}`}>
        {authorName || 'Anonymous'}
      </span>
    </div>
  );
};

export default CaseAuthorBadge;
