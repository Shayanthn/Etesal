const fs = require('fs');
let content = fs.readFileSync('src/modules/dashboard/UserDashboard.tsx', 'utf8');
const target = `                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}`;
const replacement = `                  </a>
                ))}
              </div>
            </div>
          </div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">اشتراک فعالی ندارید</h3>
                <p className="text-xs text-slate-400 mt-1">برای دریافت کانفیگ اختصاصی باید کیف پول خود را شارژ کرده و بسته خریداری کنید.</p>
              </div>
              <button
                onClick={() => setActiveTab('wallet')}
                className="mt-4 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-900/50 cursor-pointer inline-flex items-center gap-2"
              >
                <span>رفتن به کیف پول</span>
              </button>
            </div>
          )}
        </div>
      )}`;
if (content.includes(target)) {
  fs.writeFileSync('src/modules/dashboard/UserDashboard.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Not found");
}
