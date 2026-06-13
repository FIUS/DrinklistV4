import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Checkout from '../Admin/Checkout/Checkout';
import Drinks from '../Admin/Drinks/Drinks';
import Members from '../Admin/Members/Members';
import AdminOverview from '../Admin/Overview/Overview';
import Settings from '../Admin/Settings/Settings';
import Transactions from '../Admin/Transactions/Transactions';
import Login from '../Common/Login/Login';
import EventQrLogin from '../Common/Login/EventQrLogin';
import Details from '../User/Details/Details';
import UserOverview from '../User/Overview/Overview';
import Message from '../Common/Message/Message';
import MainConfigurator from '../Admin/Configurator/MainConfigurator';
import MainConfiguratorInit from '../Admin/Configurator/MainConfiguratorInit';
import Statistics from '../Admin/Statistics/Statistics';
import EventMode from '../Admin/EventMode/EventMode';
import EventQrPage from '../Admin/EventMode/EventQrPage';
import EventSummary from '../Admin/EventMode/EventSummary';
import EventSummaryPrint from '../Admin/EventMode/EventSummaryPrint';
import EventKasse from '../Event/EventKasse';
import EventGuest from '../Event/EventGuest';
import EventKasseCheckout from '../Event/EventKasseCheckout';
import EventKasseRegister from '../Event/EventKasseRegister';
import EventKasseDeposit from '../Event/EventKasseDeposit';
import EventKassePayout from '../Event/EventKassePayout';

type Props = {}

const Routing = (props: Props) => {
    return (
        <>
            <Routes>
                <Route path="/" element={<UserOverview />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/qr" element={<EventQrLogin />} />
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
                <Route path="/admin/event-mode" element={<EventMode />} />
                <Route path="/admin/event-mode/qr/:target" element={<EventQrPage />} />
                <Route path="/admin/event-mode/summary" element={<EventSummary />} />
                <Route path="/admin/event-mode/summary/print" element={<EventSummaryPrint />} />
                <Route path="/event/:secret/kasse" element={<EventKasse />} />
                <Route path="/event/:secret/kasse/checkout" element={<EventKasseCheckout />} />
                <Route path="/event/:secret/kasse/new-guest" element={<EventKasseRegister />} />
                <Route path="/event/:secret/kasse/deposit" element={<EventKasseDeposit />} />
                <Route path="/event/:secret/kasse/payout" element={<EventKassePayout />} />
                <Route path="/event/guest" element={<EventGuest />} />
            </Routes>
        </>
    )
}

export default Routing