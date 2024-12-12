import { Undo } from '@mui/icons-material';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { format } from 'react-string-format';
import { Transaction } from '../../../types/ResponseTypes';
import { BESCHREIBUNG, DATUM, KONTO, RUECKGAENGIG, SICHER_TRANSAKTION_RUECKGAENIG, SUCHE_DOT_DOT_DOT, TRANSAKTION_RUECKGAENIG, WERT } from '../../Common/Internationalization/i18n';
import Loader from '../../Common/Loader/Loader';
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer';
import { datetimeToString, dateToString, doGetRequest, doPostRequest, timeToString } from '../../Common/StaticFunctions';
import WarningPopup from '../../Common/WarningPopup/WarningPopup';
import style from './transactions.module.scss';

type Props = {}

const Transactions = (props: Props) => {
    const [transactions, settransactions] = useState<Array<Transaction>>([])
    const [searchDescription, setsearchDescription] = useState("")
    const [searchName, setsearchName] = useState("")
    const [searchDate, setsearchDate] = useState("")
    const [transactionsLoaded, settransactionsLoaded] = useState(false)
    const [warningOpen, setwarningOpen] = useState(false)
    const [transactionToDelete, settransactionToDelete] = useState<{ id: number, name: string, by: string, date: string }>({ id: -1, name: "", by: "", date: "" })

    useEffect(() => {
        doGetRequest("transactions/limit/" + window.globalTS.TRANSACTION_LIMIT).then((value) => {
            if (value.code === 200) {
                settransactions(value.content)
                settransactionsLoaded(true)
            }
        })
    }, [])

    const filteredTransactions = transactions.filter(value => {
        return ((value.description.toLowerCase().includes(searchDescription.toLowerCase()) || searchDescription === "") &&
            (value.memberName?.toLocaleLowerCase().includes(searchName.toLowerCase()) || searchName === "") &&
            (datetimeToString(new Date(value.date)).toLowerCase().includes(searchDate.toLowerCase()) || searchDate === "")) ||
            (searchDescription === "" && searchName === "" && searchDate === "")
    })


    const transactionRows = () => {
        if (transactionsLoaded) {
            return <>{filteredTransactions.map((value) => {
                return <TableRow
                    key={value.id}
                >
                    <TableCell component="th" scope="row">
                        {value.id}
                    </TableCell>
                    <TableCell>
                        {value.description}
                    </TableCell>
                    <TableCell>{value.memberName ? value.memberName : value.memberID}</TableCell>
                    <TableCell>
                        {value.amount.toFixed(2)}€
                    </TableCell>
                    <TableCell>
                        {datetimeToString(new Date(value.date))}
                    </TableCell>
                    <TableCell>
                        <Button onClick={(s_value) => {
                            settransactionToDelete(
                                {
                                    id: value.id,
                                    name: value.description,
                                    by: value.memberName !== undefined ? value.memberName : "???",
                                    date: format("{0} - {1}", dateToString(new Date(value.date)), timeToString(new Date(value.date)))
                                }
                            )
                            setwarningOpen(true)
                        }} disabled={value.partOfCheckout}>
                            <Undo />
                        </Button>
                    </TableCell>
                </TableRow>
            })}
                <WarningPopup
                    title={TRANSAKTION_RUECKGAENIG}
                    text={format(SICHER_TRANSAKTION_RUECKGAENIG, transactionToDelete.name, transactionToDelete.by, transactionToDelete.date)}
                    isOpen={warningOpen}
                    close={setwarningOpen}
                    yes={() => {
                        doPostRequest("transactions/" + transactionToDelete.id + "/undo", "").then(t_value => {
                            if (t_value.code === 200) {
                                doGetRequest("transactions/limit/" + window.globalTS.TRANSACTION_LIMIT).then((value) => {
                                    if (value.code === 200) {
                                        settransactions(value.content)
                                    }
                                })
                            }
                        })
                    }}
                    no={() => { }}
                />
            </>
        } else {
            return <>
            </>
        }
    }

    return (
        <>
            <div className={style.table}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>{BESCHREIBUNG}</TableCell>
                                <TableCell>{KONTO}</TableCell>
                                <TableCell>{WERT}</TableCell>
                                <TableCell>{DATUM}</TableCell>
                                <TableCell>{RUECKGAENGIG}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            <TableCell component="th" scope="row">
                                <Typography variant='h6'>{filteredTransactions.length}</Typography>
                            </TableCell>
                            <TableCell>
                                <TextField
                                    size='small'
                                    label={SUCHE_DOT_DOT_DOT}
                                    value={searchDescription}
                                    onChange={(value) => {
                                        setsearchDescription(value.target.value)
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    size='small'
                                    label={SUCHE_DOT_DOT_DOT}
                                    value={searchName}
                                    onChange={(value) => {
                                        setsearchName(value.target.value)
                                    }}
                                />
                            </TableCell>
                            <TableCell>

                            </TableCell>
                            <TableCell>
                                <TextField
                                    size='small'
                                    label={SUCHE_DOT_DOT_DOT}
                                    value={searchDate}
                                    onChange={(value) => {
                                        setsearchDate(value.target.value)
                                    }}
                                />
                            </TableCell>
                            <TableCell>

                            </TableCell>
                            {transactionRows()}
                        </TableBody>
                    </Table>
                </TableContainer>
                {!transactionsLoaded ? <>
                    <Spacer vertical={30} />
                    <Loader />
                </> : <></>}
            </div>
            <Spacer vertical={50} />
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Transactions