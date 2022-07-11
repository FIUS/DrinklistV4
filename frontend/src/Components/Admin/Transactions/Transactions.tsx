import { Undo } from '@mui/icons-material';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Transaction } from '../../../types/ResponseTypes';
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import style from './transactions.module.scss';

type Props = {}

const Transactions = (props: Props) => {
    const [transactions, settransactions] = useState<Array<Transaction>>([])

    useEffect(() => {
        doGetRequest("transactions").then((value) => {
            if (value.code === 200) {
                settransactions(value.content)
            }
        })
    }, [])

    return (
        <>
            <div className={style.table}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Beschreibung</TableCell>
                                <TableCell>Konto</TableCell>
                                <TableCell>Wert</TableCell>
                                <TableCell>Datum</TableCell>
                                <TableCell>Rückgängig</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((value) => {
                                return <TableRow
                                    key={value.id}
                                >
                                    <TableCell component="th" scope="row">
                                        {value.description}
                                    </TableCell>
                                    <TableCell>{value.memberID}</TableCell>
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