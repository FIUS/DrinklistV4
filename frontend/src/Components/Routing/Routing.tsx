import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Checkout from '../Admin/Checkout/Checkout';
import Drinks from '../Admin/Drinks/Drinks';
import Members from '../Admin/Members/Members';
import AdminOverview from '../Admin/Overview/Overview';
import Settings from '../Admin/Settings/Settings';
import Transactions from '../Admin/Transactions/Transactions';
import Login from '../Common/Login/Login';
import Details from '../User/Details/Details';
import UserOverview from '../User/Overview/Overview';

type Props = {}

const Routing = (props: Props) => {
    return (
        <>
            <Routes>
                <Route path="/" element={<UserOverview />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user/:userid" element={<Details />} />
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/members" element={<Members />} />
                <Route path="/admin/transactions" element={<Transactions />} />
                <Route path="/admin/drinks" element={<Drinks />} />
                <Route path="/admin/checkout" element={<Checkout />} />
                <Route path="/admin/settings" element={<Settings />} />
            </Routes>
        </>
    )
}

export default Routing