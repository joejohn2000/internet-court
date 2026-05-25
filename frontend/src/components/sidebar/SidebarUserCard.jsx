// components/sidebar/SidebarUserCard.jsx
import { Shield, UserCheck } from 'lucide-react';

const UserAvatar = ({ user }) => {
  const baseClassName = 'h-8 w-8 shrink-0 rounded-lg object-cover';
  const letterClassName = `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold ${
    user?.is_guest ? 'bg-slate-700/60 text-slate-400' : 'bg-amber-400/15 text-amber-300'
  }`;

  if (user?.profile_image && !user?.is_guest) {
    return (
      <img
        src={user.profile_image}
        alt={`${user?.username || 'User'} profile`}
        className={baseClassName}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div title={user?.username || 'Visitor'} className={letterClassName}>
      {user?.username?.[0]?.toUpperCase() || '?'}
    </div>
  );
};

const SidebarUserCard = ({ user, collapsed }) => (
  <div className={`mt-4 transition-all duration-260 ${collapsed ? 'mx-2' : 'mx-4'}`}>
    <div
      className={`rounded-xl border border-white/8 bg-white/3 transition-all duration-260 ${
        collapsed ? 'p-1.5 flex justify-center' : 'p-3.5'
      }`}
    >
      {collapsed ? (
        <UserAvatar user={user} />
      ) : (
        <div className="flex items-center gap-2.5">
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-200">
              {user?.username || 'Visitor'}
            </p>
            <p className="text-[11px] text-slate-500">
              {user?.is_guest ? 'Guest Session' : 'Authenticated'}
            </p>
          </div>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              user?.is_guest ? 'bg-slate-700/60' : 'bg-emerald-500/15'
            }`}
          >
            {user?.is_guest ? (
              <Shield size={11} className="text-slate-500" />
            ) : (
              <UserCheck size={11} className="text-emerald-400" />
            )}
          </span>
        </div>
      )}
    </div>
  </div>
);

export default SidebarUserCard;
