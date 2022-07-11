import { Key } from '@mui/icons-material'
import { Button } from '@mui/material'
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
            <Button onClick={() => setexopen(true)}><CurrencyExchangeIcon /></Button>
            <ExchangeDialog
                isOpen={exopen}
                close={() => setexopen(false)}
                member={props.member} />
            <Button onClick={() => setopen(true)}><Key /></Button>
            <PasswordDialog
                isOpen={open}
                close={() => setopen(false)}
                member={props.member} />
        </>
    )
}

export default DialogManager