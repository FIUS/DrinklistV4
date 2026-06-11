import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { openErrorToast } from '../../../Actions/CommonAction'
import { doPostRequest } from '../StaticFunctions'
import { EVENT_SCANNEN } from '../Internationalization/i18n'
import EventScanDialog from '../../Event/EventScanDialog'

const EventQrLogin = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [scanOpen, setScanOpen] = useState(true)

    const handleScan = (code: string) => {
        setScanOpen(false)
        doPostRequest('login/qr', { code }).then((value) => {
            if (value.code === 200) {
                const memberID = value.content?.memberID ?? (value.content?.member?.id ?? null)
                if (memberID !== null && memberID !== undefined) {
                    navigate('/user/' + memberID)
                } else {
                    navigate('/')
                }
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    return (
        <>
            <EventScanDialog
                open={scanOpen}
                title={EVENT_SCANNEN}
                onClose={() => navigate('/login')}
                onScanned={handleScan}
            />
        </>
    )
}

export default EventQrLogin
