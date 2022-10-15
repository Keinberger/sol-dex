// export default function InputForm({
//     setAmount,
//     inputName,
//     inputId,
//     selectName,
//     selectId,
//     setTokenSelected,
//     tokenSelected,
//     tokenSymbols,
//     margins,
// }) {
//     return (
//         <div className={`flex justify-center ${margins} mx-2 sm:mx-8 lg:mx-12 h-12`}>
//             <input
//                 className={`w-[70%] bg-zinc-900 border border-zinc-900 rounded-l-xl
//                 text-slate-200 font-mono text-lg sm:text-xl md:text-2xl px-3 md:px-5 focus:outline-none
//                 focus:border-zinc-700 focus:border`}
//                 onChange={(props) => {
//                     setAmount(props.target.value)
//                 }}
//                 placeholder={0}
//                 type="number"
//                 name={inputName}
//                 id={inputId}
//             ></input>
//             <select
//                 name={selectName}
//                 id={selectId}
//                 className={`w-auto text-center bg-zinc-900 border border-zinc-900 rounded-r-xl
//                 text-slate-200 font-mono text-xs sm:text-sm px-3 md:px-5 focus:outline-none
//                 focus:border-zinc-700 focus:border`}
//                 onChange={(props) => {
//                     setTokenSelected(props.target.value)
//                 }}
//                 defaultValue={tokenSelected}
//             >
//                 {tokenSymbols.map((token, index) => (
//                     <option value={token} id={token} key={index}>
//                         {token}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     )
// }
