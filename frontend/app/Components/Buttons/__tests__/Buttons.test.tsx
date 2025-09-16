
import React from "react";
import {screen,render} from "@testing-library/react";
import "@testing-library/jest-dom";

import MainBtn from "../MainBtn";
import BackButton from "../BackButton";


describe("Buttons testing", () => {

    describe("MainBtn Component", () => {

        it("should render the children", () => {
            render(<MainBtn>ana are mre</MainBtn>);
            expect(screen.getByText(/ana are mre/)).toBeInTheDocument();
        });


    })

    describe("BackButton Component",()=>{
        it("should render 'Go back' ",()=>{

            render(<BackButton></BackButton>);
            expect(screen.getByText(/Go back/)).toBeInTheDocument()

        })

    })

})