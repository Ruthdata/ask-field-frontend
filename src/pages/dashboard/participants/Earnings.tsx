import EarningsDashboard from '@components/earnings/EarningDashboard'
import Finance from '@components/earnings/Finance'
import React from 'react'

const Earnings = () => {
  return (
    <div>
        <Finance />
        <EarningsDashboard onDownloadStatement={()=>{}} onWithdraw={()=>{}} />
    </div>
  )
}

export default Earnings