import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React from 'react'
import DrinkButton from '../DrinkButton/DrinkButton'
import BalanceBox from './BalanceBox'
import style from './details.module.scss'
import { useNavigate } from 'react-router-dom';

type Props = {}

const Details = (props: Props) => {
    const navigate = useNavigate();

    return (
        <>
            <div className={style.details}>
                <div className={style.balanceContainer}>
                    <div className={style.balanceTop}>
                        <Typography variant='h3'>Kontostand:</Typography>
                        <Typography variant='h3'>38,15€</Typography>
                    </div>
                    <BalanceBox />
                </div>

                <div className={style.buyDrinkContainer}>
                    <Typography variant='h4'>Ich nehme...</Typography>
                    <TextField placeholder='Suche...' />
                    <div className={style.buyDrinkContainerInner}>
                        <Typography variant='h6' style={{ width: "100%" }}>Bier</Typography>
                        {Array(6).fill(<DrinkButton />)}
                        <Typography variant='h6' style={{ width: "100%" }}>Paulaner</Typography>
                        {Array(7).fill(<DrinkButton />)}
                        <Typography variant='h6' style={{ width: "100%" }}>Softdrinks</Typography>
                        {Array(9).fill(<DrinkButton />)}
                    </div>
                </div>

                <div className={style.historyContainer}>
                    <Typography variant='h4'>History</Typography>

                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Beschreibung</TableCell>
                                    <TableCell>Betrag</TableCell>
                                    <TableCell>Datum</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array(33).fill(
                                    <TableRow
                                        key={"row.name"}
                                    >
                                        <TableCell component="th" scope="row">
                                            Paulaner Spezi
                                        </TableCell>
                                        <TableCell>0,60€</TableCell>
                                        <TableCell>25.066.2022 18:23 Uhr</TableCell>

                                    </TableRow>


                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>


            </div>

            <Paper className={style.footer}>
                <Button
                    className={style.footerButton}
                    variant='contained'
                    onClick={() => navigate("/")}>
                    Zurück
                </Button>
            </Paper>
        </>
    )
}

export default Details