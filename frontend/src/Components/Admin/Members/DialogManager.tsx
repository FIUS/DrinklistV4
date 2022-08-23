import { Key } from '@mui/icons-material'
import { Button, Tooltip } from '@mui/material'
import React, { useState } from 'react'
import { Member } from '../../../types/ResponseTypes'
import ExchangeDialog from './ExchangeDialog'
import PasswordDialog from './PasswordDialog'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

type Props = {
    member: Member
}

const DialogManager = (props: Props) => {
    const [open, setopen] = useState(false)
    const [exopen, setexopen] = useState(false)

    return (
        <>
            <Tooltip title="Guthaben ändern">
                <Button onClick={() => setexopen(true)}><CurrencyExchangeIcon /></Button>
            </Tooltip>
            <ExchangeDialog
                isOpen={exopen}
                close={() => setexopen(false)}
                member={props.member} />
            <Tooltip title="Passwort ändern">
                <Button onClick={() => setopen(true)}><Key /></Button>
            </Tooltip>
            <PasswordDialog
                isOpen={open}
                close={() => setopen(false)}
                member={props.member} />
        </>
    )
}

export default DialogManager