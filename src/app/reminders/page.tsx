import { GraduationCap, ClipboardCheck, Clock, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  // Example data to verify the page is working
  const allNotifications = [
    { 
      id: 1, 
      title: '"Checkpoint 4: Review and Refine" Released', 
      course: 'Spring 2026 CGT 37000-001 LEC', 
      time: '6 hours ago', 
      status: 'Released',
      icon: <ClipboardCheck size={20}/>, 
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200'
    },
    { 
      id: 2, 
      title: 'Your grade is: 15 / 15, 100 %', 
      course: 'Spring 2026 CGT 37000-001 LEC', 
      time: '6 hours ago', 
      status: 'Updated',
      icon: <GraduationCap size={20}/>, 
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200'
    },
    { 
      id: 3, 
      title: '"Group 3 Workshop 4 NOON" updated', 
      course: 'Spring 2026 ENGL 20500-018 DIS', 
      time: 'Yesterday at 2:27 PM', 
      status: 'Updated',
      icon: <CheckCircle2 size={20}/>, 
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200'
    },
    { 
      id: 4, 
      title: 'Due in 2 hrs: Project Proposal', 
      course: 'Spring 2026 CGT 37000-001 LEC', 
      time: '2 hours ago', 
      status: 'Urgent',
      icon: <Clock size={20}/>, 
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">All Notifications</h1>
          <p className="text-slate-500 text-sm">Stay updated with your latest course activity and deadlines.</p>
        </header>

        <div className="space-y-4">
          {allNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`bg-white border ${notif.borderColor} rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className={`p-3 rounded-lg ${notif.color}`}>
                {notif.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-blue-600 hover:underline cursor-pointer text-lg">
                      {notif.title}
                    </h3>
                    <p className="text-slate-600 font-medium mt-0.5">{notif.course}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${notif.borderColor} ${notif.color}`}>
                    {notif.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {allNotifications.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl">
            <p className="text-slate-400 italic">No notification history found.</p>
          </div>
        )}
      </div>
    </div>
  );
}