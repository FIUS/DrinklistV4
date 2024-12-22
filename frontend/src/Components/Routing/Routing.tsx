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
import Message from '../Common/Message/Message';
import MainConfigurator from '../Admin/Configurator/MainConfigurator';
import MainConfiguratorInit from '../Admin/Configurator/MainConfiguratorInit';
import Statistics from '../Admin/Statistics/Statistics';

type Props = {}

const Routing = (props: Props) => {
    return (
        <>
            <Routes>
                <Route path="/" element={<UserOverview />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user/:userid" element={<Details />} />
                <Route path="/message/:message" element={<Message />} />
                <Route path="/config/start" element={<MainConfigurator />} />
                <Route path="/config/init" element={<MainConfiguratorInit />} />
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/members" element={<Members />} />
                <Route path="/admin/transactions" element={<Transactions />} />
                <Route path="/admin/drinks" element={<Drinks />} />
                <Route path="/admin/checkout" element={<Checkout />} />
                <Route path="/admin/statistics" element={<Statistics />} />
                <Route path="/admin/settings" element={<Settings />} />
            </Routes>
        </>
    )
}

export default Routing