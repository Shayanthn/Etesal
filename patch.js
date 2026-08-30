import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
`            <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 dir-rtl relative"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <MasterAdminDashboard
              onShowToast={addToast}
              onExitAdmin={() => {
                window.history.pushState({}, '', '/');
                setCurrentView('home');
              }}
            />`,
`            <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 dir-rtl relative"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <MasterAdminDashboard
                onShowToast={addToast}
                onExitAdmin={() => {
                  window.history.pushState({}, '', '/');
                  setCurrentView('home');
                }}
              />
            </Suspense>`
);
fs.writeFileSync('src/App.tsx', content);
