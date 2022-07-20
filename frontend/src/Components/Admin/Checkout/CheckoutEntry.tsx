import React, { useEffect, useState } from 'react'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import style from './checkout.module.scss';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { doGetRequest } from '../../Common/StaticFunctions';
import { Transaction } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';


type Props = {
    date: Date
}

const CheckoutEntry = (props: Props) => {

    const [isExpanded, setisExpanded] = useState(false)
    const [transactions, settransactions] = useState<Array<Transaction>>([])

    useEffect(() => {
        if (isExpanded) {
            doGetRequest("checkout").then(value => {
                if (value.code === 200) {
                    settransactions(value.content)
                }
            })
        }
    }, [isExpanded])

    const sumTransactions = () => {
        let sum = 0;
        transactions.forEach(value => sum += value.amount)
        return sum
    }

    return (
        <Accordion expanded={isExpanded} onChange={value => {
            setisExpanded(!isExpanded)
        }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography>Abrechnung {props.date.toLocaleDateString("de-DE")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell className={style.searchID}>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Menge</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions?.map(value => {
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

                        </TableBody>
                    </Table>
                </TableContainer>
                <Spacer vertical={25} />
                <div className={style.entryBottomInfo}>
                    <Typography variant="h5">
                        Gesamt: {sumTransactions()}€
                    </Typography>
                </div>
            </AccordionDetails>
        </Accordion>
    )
}

export default CheckoutEntry