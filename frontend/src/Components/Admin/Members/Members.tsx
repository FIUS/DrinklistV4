import { Delete, Money, Person, VisibilityOff } from '@mui/icons-material';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react'
import NavigationButton from '../../Common/NavigationButton/NavigationButton'
import Spacer from '../../Common/Spacer';
import style from './member.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest, doPostRequest, doRequest } from '../../Common/StaticFunctions';
import { setMembers } from '../../../Actions/CommonAction';
import DialogManager from './DialogManager';
import StatisticBox from '../../Common/InfoBox/StatisticBox';
import TopDepter from '../Common/TopDepter/TopDepter';
import { RootState } from '../../../Reducer/reducerCombiner';
import { BENUTZER_ZAHL, BUDGET, HINZUFUEGEN, KONTO, MEMBER_LOESCHEN, MODIFIZIEREN, NAME, NUTZER_LEOSCHEN, SICHER_X_LOESCHEN, SICHTBARKEIT_AENDERN, SUCHE_DOT_DOT_DOT, VERSTECKTE_NUTZER } from '../../Common/Internationalization/i18n';
import WarningPopup from '../../Common/WarningPopup/WarningPopup';
import { format } from 'react-string-format';
import MemberNameEditDialog from './MemberNameEditDialog';
import { Member } from '../../../types/ResponseTypes';
import Infobox from '../../Common/InfoBox/Infobox';
type Props = {}

const Members = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);

    const [name, setname] = useState("")
    const [balance, setbalance] = useState(0.0)
    const [password, setpassword] = useState("")
    const [alias, setalias] = useState("")
    const [searchName, setsearchName] = useState("")
    const [searchID, setsearchID] = useState("")
    const [deleteDialogOpen, setdeleteDialogOpen] = useState(false)
    const [userToDelete, setuserToDelete] = useState<{ name: string, id: number }>({ name: "", id: -1 })
    const [memberChangeOpen, setmemberChangeOpen] = useState(false)
    const [memberToChange, setmemberToChange] = useState<Member | null>(null)

    useEffect(() => {

        doGetRequest("users").then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })


    }, [dispatch])

    const calcBudget = () => {
        let budget = 0
        common.members?.forEach(member => budget += member.balance)
        return budget
    }

    const calcHiddenUsers = () => {
        let amount = 0
        common.members?.forEach(member => amount += member.hidden ? 1 : 0)
        return amount
    }


    const filteredMembers = common.members?.filter(value => {
        return ((value.name.toLocaleLowerCase().includes(searchName.toLowerCase()) ||
            value.alias.toLocaleLowerCase().includes(searchName.toLowerCase()) ||
            searchName === "") &&
            (value.id.toString().toLowerCase().includes(searchID.toLowerCase()) || searchID === "")) ||
            (searchName === "" && searchID === "")
    })

    return (
        <>
            <div className={style.statisticBoxes}>
                <StatisticBox
                    headline={BUDGET}
                    text={calcBudget().toFixed(2) + "€"}
                    icon={<Money />}
                    colorCode={window.globalTS.ICON_COLOR} />
                <StatisticBox
                    headline={BENUTZER_ZAHL}
                    text={common.members ? common.members.length.toString() : "0"}
                    icon={<Person />}
                    colorCode={window.globalTS.ICON_COLOR} />
                <StatisticBox
                    headline={VERSTECKTE_NUTZER}
                    text={calcHiddenUsers().toString()}
                    icon={< VisibilityOff />}
                    colorCode={window.globalTS.ICON_COLOR} />
                <TopDepter members={common.members} />
            </div>
            <Infobox headline='Neuen Benutzer anlegen'>
                <>
                    <div className={style.newUserBoxInputs}>
                        <TextField
                            label='Benutzername'
                            value={name}
                            onChange={(value) => {
                                setname(value.target.value)
                            }}
                            size="small"
                        />
                        <TextField
                            label='Alias (optional)'
                            value={alias}
                            onChange={(value) => {
                                setalias(value.target.value)
                            }}
                            size="small"
                        />
                        <TextField
                            label='Guthaben'
                            type="number"
                            value={balance}
                            onChange={(value) => {
                                if (parseFloat(value.target.value)) {
                                    setbalance(parseFloat(value.target.value))
                                }
                            }}
                            size="small"
                        />
                        <TextField
                            label='Passwort'
                            type="password"
                            value={password}
                            onChange={(value) => {
                                setpassword(value.target.value)
                            }}
                            size="small"
                        />
                    </div>
                    <Spacer vertical={10} />
                    <Button variant='outlined' onClick={(value) => {
                        if (name !== "" && password !== "") {
                            doPostRequest("users/add",
                                {
                                    name: name,
                                    money: balance,
                                    password: password,
                                    alias: alias
                                }
                            ).then((s_value) => {
                                if (s_value.code === 200) {
                                    setname("")
                                    setbalance(0.0)
                                    setpassword("")
                                    setalias("")
                                    doGetRequest("users").then((t_value) => {
                                        if (t_value.code === 200) {
                                            dispatch(setMembers(t_value.content))
                                        }
                                    })
                                }
                            })
                        }
                    }}>
                        {HINZUFUEGEN}
                    </Button>
                </>
            </Infobox>
            <div className={style.table}>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell className={style.searchID}>#</TableCell>
                                <TableCell>{NAME}</TableCell>
                                <TableCell>{KONTO}</TableCell>
                                <TableCell>{MODIFIZIEREN}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <TextField
                                        variant='outlined'
                                        label={SUCHE_DOT_DOT_DOT}
                                        value={searchID}
                                        onChange={(value) => {
                                            setsearchID(value.target.value)
                                        }}
                                        className={style.searchID}
                                        size="small"
                                        type="number"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        variant='outlined'
                                        label={SUCHE_DOT_DOT_DOT}
                                        value={searchName}
                                        onChange={(value) => {
                                            setsearchName(value.target.value)
                                        }}
                                        className={style.searchName}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {filteredMembers?.map(value => {
                                return <TableRow
                                    key={value.id}
                                    className={value.hidden ? style.hidden : ""}
                                >
                                    <TableCell>{value.id}</TableCell>
                                    <TableCell component="th" scope="row">
                                        <Button
                                            sx={{ color: "text.primary", textTransform: "none" }}
                                            onClick={() => {
                                                setmemberToChange(value)
                                                setmemberChangeOpen(true)
                                            }}
                                        >
                                            {value.alias !== "" ? format("{0} ({1})", value.name, value.alias) : value.name}
                                        </Button>

                                    </TableCell>
                                    <TableCell>{value.balance.toFixed(2)}€</TableCell>
                                    <TableCell>
                                        <DialogManager member={value} />
                                        <Tooltip title={SICHTBARKEIT_AENDERN}>
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
                                                <VisibilityOff />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title={NUTZER_LEOSCHEN}>
                                            <Button onClick={() => {
                                                setuserToDelete({ name: value.name, id: value.id })
                                                setdeleteDialogOpen(true)
                                            }}>
                                                <Delete />
                                            </Button>
                                        </Tooltip>

                                    </TableCell>


                                </TableRow>
                            })}

                        </TableBody>
                    </Table>
                </TableContainer>
                <WarningPopup
                    title={MEMBER_LOESCHEN}
                    text={format(SICHER_X_LOESCHEN, userToDelete.name)}
                    isOpen={deleteDialogOpen}
                    close={setdeleteDialogOpen}
                    yes={() => {
                        doRequest("DELETE", "users/" + userToDelete.id + "/delete", "").then((s_value) => {
                            if (s_value.code === 200) {
                                doGetRequest("users").then((t_value) => {
                                    if (t_value.code === 200) {
                                        dispatch(setMembers(t_value.content))
                                    }
                                })
                            }
                        })
                    }}
                    no={() => { }}
                />
                <MemberNameEditDialog
                    isOpen={memberChangeOpen}
                    close={() => setmemberChangeOpen(false)}
                    member={memberToChange ? memberToChange : {
                        id: 0,
                        name: "",
                        balance: 0,
                        hidden: true,
                        alias: ""
                    }}
                />
            </div>
            <Spacer vertical={50} />
            <NavigationButton destination='/admin' />
        </>
    )
}

export default Members