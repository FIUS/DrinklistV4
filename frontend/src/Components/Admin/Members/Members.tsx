import { AddBox, Delete, DownhillSkiing } from '@mui/icons-material';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer';
import style from './member.module.scss';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { setMembers } from '../../../Actions/CommonAction';
import DialogManager from './DialogManager';

type Props = {}

const Members = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);

    const [name, setname] = useState("")
    const [balance, setbalance] = useState(0.0)
    const [password, setpassword] = useState("")

    useEffect(() => {

        doGetRequest("users").then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })


    }, [dispatch])
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
                                    <TextField
                                        variant='standard'
                                        label="Name"
                                        value={name}
                                        onChange={(value) => {
                                            setname(value.target.value)
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        variant='standard'
                                        label="Geld"
                                        value={balance}
                                        onChange={(value) => {
                                            if (parseFloat(value.target.value)) {
                                                setbalance(parseFloat(value.target.value))
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className={style.firstRowAlign}>
                                        <TextField
                                            type="password"
                                            variant='standard'
                                            label="Passwort"
                                            value={password}
                                            onChange={(value) => {
                                                setpassword(value.target.value)
                                            }}
                                        />
                                        <Button onClick={(value) => {
                                            if (name !== "" && password !== "") {
                                                doPostRequest("users/add",
                                                    {
                                                        name: name,
                                                        money: balance,
                                                        password: password
                                                    }
                                                ).then((s_value) => {
                                                    if (s_value.code === 200) {
                                                        setname("")
                                                        setbalance(0.0)
                                                        setpassword("")
                                                        doGetRequest("users").then((t_value) => {
                                                            if (t_value.code === 200) {
                                                                dispatch(setMembers(t_value.content))
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        }}>
                                            <AddBox />
                                        </Button>
                                    </div>
                                </TableCell>

                            </TableRow>
                            {common.members?.map(value => {
                                return <TableRow
                                    key={value.id}
                                    className={value.hidden ? style.hidden : ""}
                                >
                                    <TableCell component="th" scope="row">
                                        {value.name}
                                    </TableCell>
                                    <TableCell>{value.balance.toFixed(2)}€</TableCell>
                                    <TableCell>
                                        <DialogManager member={value} />
                                        <Button onClick={() => {
                                            doPostRequest("users/" + value.id + "/visibility/toggle", "").then((s_value) => {
                                                if (s_value.code === 200) {
                                                    doGetRequest("users").then((t_value) => {
                                                        if (t_value.code === 200) {
                                                            dispatch(setMembers(t_value.content))
                                                        }
                                                    })
                                                }
                                            })
                                        }}>
                                            <DownhillSkiing />
                                        </Button>
                                        <Button onClick={() => {
                                            doPostRequest("users/" + value.id + "/delete", "").then((s_value) => {
                                                if (s_value.code === 200) {
                                                    doGetRequest("users").then((t_value) => {
                                                        if (t_value.code === 200) {
                                                            dispatch(setMembers(t_value.content))
                                                        }
                                                    })
                                                }
                                            })
                                        }}>
                                            <Delete />
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

export default Members