import React, { useEffect, useState } from 'react'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import style from './checkout.module.scss';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { doGetRequest } from '../../Common/StaticFunctions';
import { Checkout } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';
import { EINNAHMEN, EINZAHLUNGEN, KASSE_DIFFERENZ, KASSE_NACH_ABRECHNUNG, KASSE_VOR_ABRECHNUNG, NAME, RECHNUNGEN, VALUE } from '../../Common/Internationalization/i18n';

type Props = {
    checkout: Checkout,
    prevCheckout?: Checkout
}

const CheckoutEntry = (props: Props) => {

    const [isExpanded, setisExpanded] = useState(false)
    const [loadedCheckout, setloadedCheckout] = useState<Checkout>()

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
        <Accordion expanded={isExpanded} onChange={value => {
            setisExpanded(!isExpanded)
        }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography>
                    Abrechnung {new Date(props.checkout.date).toLocaleDateString("de-DE")}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div className={style.entryBottomInfo}>
                    <Typography variant="h5">
                        {KASSE_VOR_ABRECHNUNG}: {props.prevCheckout ? props.prevCheckout?.currentCash.toFixed(2) : (0).toFixed(2)}€
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
                                        {value.amount.toFixed(2)}€
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
                                    {sumTransactionsNormal().toFixed(2)}€
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
                                        {(-value.amount).toFixed(2)}€
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
                                    {(-sumTransactionsInvoices()).toFixed(2)}€
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <Spacer vertical={40} />
                <div className={style.entryBottomInfo}>
                    <Typography variant="h5">
                        {KASSE_NACH_ABRECHNUNG}: {props.checkout.currentCash.toFixed(2)}€
                    </Typography>
                    <Typography variant="h5">
                        {EINNAHMEN}: {(props.checkout.currentCash - (props.prevCheckout ? props.prevCheckout?.currentCash : 0)).toFixed(2)}€
                    </Typography>
                    <Typography variant="h5">
                        {KASSE_DIFFERENZ}: {lostMoney().toFixed(2)}€
                    </Typography>
                </div>
            </AccordionDetails>
        </Accordion>
    )
}

export default CheckoutEntry