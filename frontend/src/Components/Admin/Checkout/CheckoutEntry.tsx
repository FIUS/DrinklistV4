import React, { useEffect, useState } from 'react'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import style from './checkout.module.scss';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { doGetRequest, doRequest } from '../../Common/StaticFunctions';
import { Checkout } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';
import { EINNAHMEN, EINZAHLUNGEN, ERFOLGREICH_RUECKGAENIG_GEMACHT, KASSE_DIFFERENZ, KASSE_NACH_ABRECHNUNG, KASSE_VOR_ABRECHNUNG, NAME, RECHNUNGEN, RUECKGAENGIG, VALUE } from '../../Common/Internationalization/i18n';
import { useDispatch } from 'react-redux';
import { openErrorToast, openToast } from '../../../Actions/CommonAction';
import { convertToLocalDate, formatMoney } from '../../Common/StaticFunctionsTyped';

type Props = {
    checkout: Checkout,
    reload: () => void,
    prevCheckout?: Checkout,
    firstElement?: boolean
}

const CheckoutEntry = (props: Props) => {

    const [isExpanded, setisExpanded] = useState(false)
    const [loadedCheckout, setloadedCheckout] = useState<Checkout>()
    const [undoInProgress, setundoInProgress] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        if (isExpanded) {
            doGetRequest("checkout/" + props.checkout.id).then(value => {
                if (value.code === 200) {
                    setloadedCheckout(value.content)
                }
            })
        }
    }, [isExpanded, props.checkout.id])

    const sumTransactionsNormal = () => {
        let sum = 0;
        loadedCheckout?.transactions?.filter((value) => value.memberID !== 1).forEach(value => sum += value.amount)
        return sum
    }

    const sumTransactionsInvoices = () => {
        let sum = 0;
        loadedCheckout?.transactions?.filter((value) => value.memberID === 1).forEach(value => sum += value.amount)
        return sum
    }

    const lostMoney = () => {
        const before = props.prevCheckout ? props.prevCheckout?.currentCash : 0;
        const after = props.checkout.currentCash;
        const income = sumTransactionsNormal();
        const outgoing = sumTransactionsInvoices();

        const target = before + income - outgoing
        const actual = after

        return actual - target
    }


    return (
        <Accordion expanded={isExpanded} onChange={() => {
            setisExpanded(!isExpanded)
        }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography>
                    Abrechnung {convertToLocalDate(props.checkout.date).toLocaleDateString("de-DE")}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div className={style.entryBottomInfo}>
                    <Typography variant="h5">
                        {KASSE_VOR_ABRECHNUNG}: {formatMoney(props.prevCheckout ? props.prevCheckout?.currentCash : 0)}€
                    </Typography>
                </div>
                <Typography variant='overline'> {EINZAHLUNGEN}</Typography>
                <Spacer vertical={10} />
                <TableContainer component={Paper} className={style.table}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell className={style.searchID}>#</TableCell>
                                <TableCell>{NAME}</TableCell>
                                <TableCell>{VALUE}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadedCheckout?.transactions?.filter((value) => value.memberID !== 1)?.map(value => {
                                return <TableRow
                                    key={value.id}
                                >
                                    <TableCell component="th" scope="row">
                                        {value.id}
                                    </TableCell>
                                    <TableCell>
                                        {value.memberName}
                                    </TableCell>
                                    <TableCell>
                                        {formatMoney(value.amount)}€
                                    </TableCell>
                                </TableRow>
                            })}
                            <TableRow
                            >
                                <TableCell component="th" scope="row">

                                </TableCell>
                                <TableCell>

                                </TableCell>
                                <TableCell className={style.sum}>
                                    {formatMoney(sumTransactionsNormal())}€
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <Spacer vertical={30} />
                <Typography variant='overline'>{RECHNUNGEN}</Typography>
                <Spacer vertical={10} />
                <TableContainer component={Paper} className={style.table}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell className={style.searchID}>#</TableCell>
                                <TableCell>{NAME}</TableCell>
                                <TableCell>{VALUE}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadedCheckout?.transactions?.filter((value) => value.memberID === 1).map(value => {
                                return <TableRow
                                    key={value.id}
                                >
                                    <TableCell component="th" scope="row">
                                        {value.id}
                                    </TableCell>
                                    <TableCell>
                                        {value.description}
                                    </TableCell>
                                    <TableCell>
                                        {formatMoney(-value.amount)}€
                                    </TableCell>
                                </TableRow>
                            })}
                            <TableRow
                            >
                                <TableCell component="th" scope="row">

                                </TableCell>
                                <TableCell>

                                </TableCell>
                                <TableCell className={style.sum}>
                                    {formatMoney(-sumTransactionsInvoices())}€
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <Spacer vertical={40} />
                <div className={style.entryBottomInfo}>

                    <Typography variant="h5">
                        {KASSE_NACH_ABRECHNUNG}: {formatMoney(props.checkout.currentCash)}€
                    </Typography>
                    <Typography variant="h5">
                        {EINNAHMEN}: {formatMoney(props.checkout.currentCash - (props.prevCheckout ? props.prevCheckout?.currentCash : 0))}€
                    </Typography>
                    <Typography variant="h5">
                        {KASSE_DIFFERENZ}: {formatMoney(lostMoney())}€
                    </Typography>
                    <Button variant='outlined' color='error' disabled={!props.firstElement || undoInProgress} onClick={() => {
                        setundoInProgress(true)
                        doRequest("DELETE", "checkout/" + props.checkout.id, "").then(value => {
                            if (value.code === 200) {
                                props.reload()
                                dispatch(openToast({ message: ERFOLGREICH_RUECKGAENIG_GEMACHT }))
                            } else {
                                dispatch(openErrorToast())
                            }
                            setundoInProgress(false)
                        })
                    }}>
                        {RUECKGAENGIG}
                    </Button>
                </div>
            </AccordionDetails>
        </Accordion>
    )
}

export default CheckoutEntry
