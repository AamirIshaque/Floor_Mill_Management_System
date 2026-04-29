
import React from 'react';

const PageShell = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
             <h3 className="text-xl font-semibold text-slate-700 border-b pb-4 mb-4">{title}</h3>
            <div>
                {children}
            </div>
        </div>);

};

export default PageShell;