import style from './checkout.module.scss';
import React, { useEffect, useState } from 'react'
import CheckoutEntry from './CheckoutEntry';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { Checkout as CheckoutType, Member } from '../../../types/ResponseTypes';
import { Autocomplete, Button, TextField, Typography } from '@mui/material';
import { AddBox } from '@mui/icons-material';
import Spacer from '../../Common/Spacer';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import CloseIcon from '@mui/icons-material/Close';
import { setMembers } from '../../../Actions/CommonAction';
import { RootState } from '../../../Reducer/reducerCombiner';

type Props = {}

const Checkout = (props: Props) => {

    const [checkouts, setcheckouts] = useState<Array<CheckoutType>>([])
    const [isAddOpen, setisAddOpen] = useState(false)
    const [selectedUser, setselectedUser] = useState("")
    const [toCheckout, settoCheckout] = useState<Array<{ member: Member, amount: number }>>([])

    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const dispatch = useDispatch()

    useEffect(() => {
        doGetRequest("checkout").then(value => {
            if (value.code === 200) {
                setcheckouts(value.content)
            }
        })

        if (!common.members || common.members?.length === 0)
            doGetRequest("users").then((value) => {
                if (value.code === 200) {
                    dispatch(setMembers(value.content))
                }
            })
    }, [dispatch, common.members])

    const resetAdd = () => {
        setselectedUser("")
        settoCheckout([])
        setisAddOpen(false)
    }

    const checkCanAddUser = () => {
        const toAdd = common.members?.find(value => {
            return value.name === selectedUser
        })
        if (toAdd && toCheckout.find(value => value.member.id === toAdd.id) === undefined) {
            return toAdd
        }
        return null
    }

    const addDialog = () => {
        if (isAddOpen) {
            return <><TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Aktueller Kontostand</TableCell>
                            <TableCell>Buchung</TableCell>
                            <TableCell>Hinzufügen / <br /> Entfernen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" scope="row">
                                <Autocomplete
                                    freeSolo
                                    options={common.members ? common.members.map(value => value.name) : []}
                                    value={selectedUser}
                                    onChange={(event, value) => { setselectedUser(value !== null ? value : "") }}
                                    renderInput={(params) =>
                                        <TextField {...params}
                                            label='Name'
                                            variant='standard'
                                            onChange={(value) => { setselectedUser(value.target.value) }}
                                            className={style.textfield}
                                        />
                                    }
                                />
                            </TableCell>
                            <TableCell>
                            </TableCell>
                            <TableCell>
                            </TableCell>
                            <TableCell>
                                <Button
                                    disabled={checkCanAddUser() === null}
                                    onClick={() => {
                                        const toAdd = checkCanAddUser()
                                        if (toAdd !== null) {
                                            settoCheckout([...toCheckout, { member: toAdd, amount: 0 }].sort((a, b) => a.member.id - b.member.id))
                                            setselectedUser("")
                                        }
                                    }
                                    }
                                >
                                    <AddBox />
                                </Button>
                            </TableCell>
                        </TableRow>
                        {toCheckout.map((value) => {
                            return <TableRow>
                                <TableCell component="th" scope="row">
                                    {value.member.name}
                                </TableCell>
                                <TableCell>
                                    {value.member.balance.toFixed(2)}€
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        label="Betrag"
                                        type="number"
                                        onChange={(textValue) => {
                                            const newValue = textValue.target.value
                                            const others = toCheckout.filter(checkout => checkout.member.id !== value.member.id)
                                            settoCheckout([...others, { member: value.member, amount: parseFloat(newValue) }].sort((a, b) => a.member.id - b.member.id))
                                        }
                                        }
                                        className={style.textfield} />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => {
                                            settoCheckout(toCheckout.filter(checkout => checkout.member.id !== value.member.id))
                                        }}
                                    >
                                        <IndeterminateCheckBoxIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        })}

                    </TableBody>
                </Table>
            </TableContainer>
                <Button
                    disabled={
                        toCheckout.find(checkout => {
                            return checkout.amount === 0 || Number.isNaN(checkout.amount)
                        }
                        ) !== undefined || toCheckout.length === 0
                    }
                    onClick={() => {
                        if (toCheckout.find(checkout => checkout.amount === 0) === undefined) {
                            doPostRequest("checkout", toCheckout.map(value => {
                                return { memberID: value.member.id, amount: value.amount }
                            })).then(value => {
                                if (value.code === 200) {
                                    resetAdd()
                                    doGetRequest("checkout").then(value => {
                                        if (value.code === 200) {
                                            setcheckouts(value.content)
                                        }
                                    })
                                }
                            })
                        }
                    }}
                >
                    Abrechnung abschließen
                </Button>
            </>

        } else {
            return <></>
        }
    }

    return (
        <div className={style.container}>
            <div className={style.newCheckoutContainer}>
                <div className={style.newCheckoutContainerHeadline}>
                    <Typography variant="h6">
                        Neue Abrechnung
                    </Typography>
                    <Button
                        onClick={() => {
                            if (isAddOpen) {
                                resetAdd();
                            } else {
                                setisAddOpen(true)
                            }
                        }}
                    >
                        {isAddOpen ? <CloseIcon /> : <AddBox />}
                    </Button>
                </div>
                {addDialog()}
            </div>
            <Spacer vertical={20} />

            {checkouts.map(value => <CheckoutEntry checkout={value} />)}
        </div>
    )
}

export default Checkout
