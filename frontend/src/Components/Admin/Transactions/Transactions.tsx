import { Undo } from '@mui/icons-material';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer';
import style from './transactions.module.scss';

type Props = {}

const Transactions = (props: Props) => {
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

                            {Array(33).fill(
                                <TableRow
                                    key={"row.name"}
                                >
                                    <TableCell component="th" scope="row">
                                        Test transaktion
                                    </TableCell>
                                    <TableCell>Tom</TableCell>
                                    <TableCell>
                                        0,60€
                                    </TableCell>
                                    <TableCell>
                                        26.06.2022 16:32Uhr
                                    </TableCell>
                                    <TableCell>
                                        <Button><Undo /></Button>
                                    </TableCell>
                                </TableRow>
                            )}
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