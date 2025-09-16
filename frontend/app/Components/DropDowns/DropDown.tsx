import React, { useState } from "react";

type MultiSelectDropdownType = {
  projects: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
};

export default function MultiSelectDropdown({
  projects,
  selectedOptions,
  onSelectionChange,
}: MultiSelectDropdownType) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function handleOptionClick(option: string) {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter((item) => item !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  }

  return (
    <div className="relative ">
      <div
        onClick={toggleDropdown}
        className={`rounded px-4 py-2 font-semibold shadow  cursor-pointer text-center mt-1 text-white bg-blue h-[40px] transition-transform duration-200 hover:scale-95 active:scale-90 ${
          isOpen && "rounded-bl-[0px] rounded-br-[0px]"
        }`}
      >
        {selectedOptions.length > 0
          ? selectedOptions.length > 2
            ? `${selectedOptions.length} selected projects`
            : selectedOptions.join(", ")
          : "Choose the projects"}
      </div>
      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 border border-gray-300 bg-white z-50 max-h-52  ${
            projects.length > 4
              ? "overflow-y-auto"
              : "overflow-y-hidden rounded-bl-[10px] rounded-br-[10px]"
          } `}
        >
          {projects.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`p-2 cursor-pointer flex justify-between items-center  ${
                selectedOptions.includes(option) ? "bg-blueLight" : "bg-white"
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
