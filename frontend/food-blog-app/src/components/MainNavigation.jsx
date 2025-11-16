import React, { useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Outlet } from "react-router-dom"

export default function MainNavigation(){
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <>
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />
      <Outlet context={{ searchQuery, setSearchQuery }} />
      <Footer/>
    </>
  )
}