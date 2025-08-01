// src/layouts/RootLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import ScrollToTop from '../components/ScrollToTop'

const RootLayout = () => (
  <>
    <ScrollToTop />
    {/* this could be your header/nav */}
    <Outlet />
    {/* this could be your footer */}
  </>
)

export default RootLayout
