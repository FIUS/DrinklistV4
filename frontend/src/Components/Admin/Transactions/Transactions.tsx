import { Undo } from '@mui/icons-material';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Transaction } from '../../../types/ResponseTypes';
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import style from './transactions.module.scss';

type Props = {}

const Transactions = (props: Props) => {
    const [transactions, settransactions] = useState<Array<Transaction>>([])
    const [searchDescription, setsearchDescription] = useState("")
    const [searchName, setsearchName] = useState("")
    const [searchDate, setsearchDate] = useState("")

    useEffect(() => {
        doGetRequest("transactions").then((value) => {
            if (value.code === 200) {
                settransactions(value.content)
            }
        })
    }, [])

    const filteredTransactions = transactions.filter(value => {
        return ((value.description.toLowerCase().includes(searchDescription.toLowerCase()) || searchDescription === "") &&
            (value.memberName?.toLocaleLowerCase().includes(searchName.toLowerCase()) || searchName === "") &&
            (value.date.toLowerCase().includes(searchDate.toLowerCase()) || searchDate === "")) ||
            (searchDescription === "" && searchName === "" && searchDate === "")
    })

    return (
        <>
            <div className={style.table}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Beschreibung</TableCell>
                                <TableCell>Konto</TableCell>
                                <TableCell>Wert</TableCell>
                                <TableCell>Datum</TableCell>
                                <TableCell>Rückgängig</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            <TableCell component="th" scope="row">
                                <Typography variant='h6'>{filteredTransactions.length}</Typography>
                            </TableCell>
                            <TableCell>
                                <TextField
                                    size='small'
                                    label="Suche..."
                                    value={searchDescription}
                                    onChange={(value) => {
                                        setsearchDescription(value.target.value)
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    size='small'
                                    label="Suche..."
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
                                    label="Suche..."
                                    value={searchDate}
                                    onChange={(value) => {
                                        setsearchDate(value.target.value)
                                    }}
                                />
                            </TableCell>
                            <TableCell>

                            </TableCell>
                            {filteredTransactions.map((value) => {
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
                                        {value.date}
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={(s_value) => {
                                            doPostRequest("transactions/" + value.id + "/undo", "").then(t_value => {
                                                if (t_value.code === 200) {
                                                    doGetRequest("transactions").then((value) => {
                                                        if (value.code === 200) {
                                                            settransactions(value.content)
                                                        }
                                                    })
                                                }
                                            })
                                        }}>
                                            <Undo />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

            </div>
            <Spacer vertical={50} />
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Transactions