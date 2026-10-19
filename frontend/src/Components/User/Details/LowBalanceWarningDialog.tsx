import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import React from 'react'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import QRCode from 'react-qr-code'
import { LOW_BALANCE_MESSAGE, LOW_BALANCE_NO_QR, LOW_BALANCE_QR_BANK, LOW_BALANCE_QR_PAYPAL, LOW_BALANCE_TITLE, OK, WARNUNG, ZAHLUNGSINFORMATIONEN } from '../../Common/Internationalization/i18n'
import { LowBalanceWarningResponse } from '../../../types/ResponseTypes'
import style from './lowBalanceWarningDialog.module.scss'
import { formatMoney } from '../../Common/StaticFunctionsTyped'

type Props = {
    isOpen: boolean,
    paymentInfoOnly?: boolean,
    warning: LowBalanceWarningResponse | null,
    onClose: () => void
}

const LowBalanceWarningDialog = (props: Props) => {
    if (!props.warning) {
        return null
    }

    const labelForType = (type: string) => {
        if (type === "epc") {
            return LOW_BALANCE_QR_BANK
        }
        if (type === "paypal") {
            return LOW_BALANCE_QR_PAYPAL
        }
        return "QR"
    }

    const depositText = formatMoney(props.warning.depositAmount)
    const hasQrCodes = props.warning.qrCodes.length > 0

    return (
        <Dialog open={props.isOpen} onClose={props.onClose} maxWidth="sm" fullWidth>
            <DialogTitle className={style.title} sx={props.paymentInfoOnly ? undefined : { color: "warning.light" }}>
                {!props.paymentInfoOnly ? <WarningAmberIcon sx={{ color: "warning.light" }} /> : null}
                <Typography variant='h5'>
                    {props.paymentInfoOnly ? ZAHLUNGSINFORMATIONEN : <>{WARNUNG}: {LOW_BALANCE_TITLE}</>}
                </Typography>
            </DialogTitle>
            <DialogContent className={style.content}>
                {!props.paymentInfoOnly ? <Typography variant='caption'>{LOW_BALANCE_MESSAGE}</Typography> : null}

                {hasQrCodes ? <div className={style.qrGrid}>
                    {props.warning.qrCodes.map((code, index) => {
                        return <div key={`${code.type}-${index}`} className={style.qrCard}>
                            <Typography className={style.qrLabel}>{labelForType(code.type)}</Typography>
                            <Stack className={style.qrCode} gap={1} alignItems={'center'}>
                                <QRCode value={code.payload} size={160} />
                                <Typography variant='overline'>{depositText}€</Typography>
                            </Stack>
                        </div>
                    })}
                </div> : <Typography className={style.noQr}>{LOW_BALANCE_NO_QR}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>{OK}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default LowBalanceWarningDialog
