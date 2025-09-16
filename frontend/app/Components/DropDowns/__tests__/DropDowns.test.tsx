import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DropDown from "../DropDown";
import SingleDropDown from "../DropDownS";
import MultiSelectDropdown from "../DropDownMT";
import "@testing-library/jest-dom";

const DUMMYDATA = ["proj1", "proj2", "proj3", "proj4", "proj5"];

describe("DropDowns", () => {
  describe("DropDown", () => {
    it("should render dropdown default text", () => {
      render(
        <DropDown
          projects={DUMMYDATA}
          selectedOptions={[]}
          onSelectionChange={jest.fn()}
        />
      );
      const dropdownInitialText = screen.getByText("Choose the projects");
      expect(dropdownInitialText).toBeInTheDocument();
    });

    it("should render dropdown with selected options", () => {
      render(
        <DropDown
          projects={DUMMYDATA}
          selectedOptions={[]}
          onSelectionChange={jest.fn()}
        />
      );

      const toggle = screen.getByText("Choose the projects");
      fireEvent.click(toggle);

      // Expect to see all project options rendered
      DUMMYDATA.forEach((project) => {
        expect(screen.getByText(project)).toBeInTheDocument();
      });
    });

    it('should show "proj4, proj5" when more than 2 options are selected', () => {
      render(
        <DropDown
          projects={DUMMYDATA}
          selectedOptions={["proj4", "proj5"]}
          onSelectionChange={jest.fn()}
        />
      );

      const togg = screen.getByText("proj4, proj5");
      expect(togg).toBeInTheDocument();
    });

    it('should show "3 selected projects" when 3 options are selected', () => {
      render(
        <DropDown
          projects={DUMMYDATA}
          selectedOptions={["proj1", "proj2", "proj3"]}
          onSelectionChange={jest.fn()}
        />
      );

      const togg = screen.getByText("3 selected projects");
      expect(togg).toBeInTheDocument();
    });
  });

  describe("SingleDropDown", () => {
    it("should have the 'test' text as the text when there are no selected options ",()=>{

        render(<SingleDropDown languages={[]} onSelectionChange={jest.fn()} btnText="Test" />)
        const dropdownInitialText = screen.getByText("Test");
        expect(dropdownInitialText).toBeInTheDocument();
    })

    it("should show the dropdown with the selected option", () => {

        render(<SingleDropDown languages={DUMMYDATA} onSelectionChange={jest.fn()} btnText="Test"/>)
        const toggle =screen.getByText("Test");
        fireEvent.click(toggle);
        
        DUMMYDATA.forEach((language)=>{
            expect(screen.getByText(language)).toBeInTheDocument();
        })

    })

    it("should show 'proj1' on the button ( selected option )  ",()=>{
        render(<SingleDropDown languages={DUMMYDATA} selectedOption={DUMMYDATA[0]} onSelectionChange={jest.fn()} btnText="Test"/>)
        const toggle=screen.getByText(DUMMYDATA[0]);
        expect(toggle).toBeInTheDocument();

    })



  })

  describe("MultipleDropdown",()=>{

    it("should render dropdown default text", () => {
      render(
        <MultiSelectDropdown
          domains={DUMMYDATA}
          selectedOptions={[]}
          onSelectionChange={jest.fn()}
          btnText="Test"
        />
      );
      const dropdownInitialText = screen.getByText("Test");
      expect(dropdownInitialText).toBeInTheDocument();
    });

    it("should render dropdown with selected options", () => {
      render(
        <MultiSelectDropdown
          domains={DUMMYDATA}
          selectedOptions={[]}
          onSelectionChange={jest.fn()}
          btnText={"Test"}
        />
      );

      const toggle = screen.getByText("Test");
      fireEvent.click(toggle);

      // Expect to see all project options rendered
      DUMMYDATA.forEach((project) => {
        expect(screen.getByText(project)).toBeInTheDocument();
      });
    });

    it('should show "proj4, proj5" when more than 2 options are selected', () => {
      render(
        <MultiSelectDropdown
          domains={DUMMYDATA}
          selectedOptions={["proj4", "proj5"]}
          onSelectionChange={jest.fn()}
          btnText="Test"
        />
      );

      const togg = screen.getByText("proj4, proj5");
      expect(togg).toBeInTheDocument();
    });

    it('should show "3 selected domains" when 3 options are selected', () => {
      render(
        <MultiSelectDropdown
          domains={DUMMYDATA}
          selectedOptions={["proj1", "proj2", "proj3"]}
          onSelectionChange={jest.fn()}
          btnText="Test"
        />
      );

      const togg = screen.getByText("3 selected domains");
      expect(togg).toBeInTheDocument();
    });

  })
})
