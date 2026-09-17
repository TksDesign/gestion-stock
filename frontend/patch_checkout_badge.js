import fs from 'fs';
const path = 'src/pages/Checkout.tsx';
let content = fs.readFileSync(path, 'utf8');

const search = `<div className="relative w-16 h-20 bg-gray-200 dark:bg-gray-800 rounded-sm overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                     <img src={item.imageUrl || item.image} className="w-full h-full object-cover" />
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10">{item.quantity}</span>
                   </div>`;

const replace = `<div className="relative w-16 h-20 flex-shrink-0">
                     <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                       <img src={item.imageUrl || item.image} className="w-full h-full object-cover" />
                     </div>
                     <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10">{item.quantity}</span>
                   </div>`;

if(content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(path, content);
    console.log("Patched!");
} else {
    console.log("Could not find the exact snippet.");
}
