import React, { useState } from "react";
type SingleDropDownType = {
  languages: string[];
  selectedOption?: string;
  onSelectionChange: (selected: string) => void;
  btnText: string;
};
export default function SingleDropDown({
  languages,
  selectedOption,
  onSelectionChange,
  btnText,
}: SingleDropDownType) {
  const [isOpen, setIsOpen] = useState(false);
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }
  function handleOptionClick(option: any) {
    onSelectionChange(option);
    setIsOpen(false);
  }
  return (
    <div className="relative ">
      <div
        onClick={toggleDropdown}
        className={`rounded px-4 py-2 font-semibold shadow  cursor-pointer text-center mt-1 text-white bg-blue h-[40px] transition-transform duration-200 hover:scale-95 active:scale-90 ${
          isOpen && "rounded-bl-[0px] rounded-br-[0px]"
        }`}
      >
        {selectedOption ? selectedOption : `${btnText}`}
      </div>
      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 border border-gray-300 bg-white z-50 max-h-52  ${
            languages.length > 4
              ? "overflow-y-auto"
              : "overflow-y-hidden rounded-bl-[10px] rounded-br-[10px]"
          } `}
        >
          {languages.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`p-2 cursor-pointer flex justify-between items-center  ${
                selectedOption === option ? "bg-blueLight" : "bg-white"
              }`}
            >
              {option}
              {/* <div className={`p-2 border-2 border-red w-[20px] h-[20px] ${selectedOptions.includes(option) ? "bg-blueLight" : "bg-white"}`}></div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
