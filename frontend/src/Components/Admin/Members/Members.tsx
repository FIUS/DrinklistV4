import { AddBox, Delete, Key, DownhillSkiing } from '@mui/icons-material';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import React from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer';
import style from './member.module.scss';

type Props = {}

const Members = (props: Props) => {
    return (
        <>
            <div className={style.table}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Konto</TableCell>
                                <TableCell>Modifizieren</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow
                                key={"row.name"}
                            >
                                <TableCell component="th" scope="row">
                                    <TextField variant='standard' label="Name" />
                                </TableCell>
                                <TableCell><TextField type="number" variant='standard' label="Geld" /></TableCell>
                                <TableCell>
                                    <div className={style.firstRowAlign}>
                                        <TextField type="password" variant='standard' label="Passwort" />
                                        <Button><AddBox /></Button>
                                    </div>
                                </TableCell>

                            </TableRow>
                            {Array(33).fill(
                                <TableRow
                                    key={"row.name"}
                                >
                                    <TableCell component="th" scope="row">
                                        Paulaner Spezi urhigtdisghu ih u
                                    </TableCell>
                                    <TableCell>0,60€</TableCell>
                                    <TableCell>
                                        <Button><Key /></Button>
                                        <Button><DownhillSkiing /></Button>
                                        <Button><Delete /></Button>
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

export default Members