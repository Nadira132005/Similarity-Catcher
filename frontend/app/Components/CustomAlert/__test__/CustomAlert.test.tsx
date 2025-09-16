import React from "react";
import {screen,render} from "@testing-library/react"
import "@testing-library/jest-dom"
import Alert from "../CustomAlert";


describe("CustomAlert component test",()=>{

    it("should render '×'",()=>{

        render(<Alert message="test" onClose={()=>{}} ></Alert>)
        expect(screen.getByText(/×/)).toBeInTheDocument()

    })

    it("should render the message",()=>{

        render(<Alert message="test" onClose={()=>{}}/>)
        expect(screen.getByText(/test/)).toBeInTheDocument()


    })

    it("should add the 'className' props to the className ",()=>{
        render(<Alert message="test" onClose={()=>{}} className="bg-red-600"></Alert>)
        const alertWrapper=screen.getByText(/test/).closest("div");
        expect(alertWrapper).toHaveClass(/bg-red-600/)
        
    })


})