import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Member } from '../../../types/ResponseTypes';
import Spacer from '../../Common/Spacer';
import { Button, Checkbox, FormControlLabel, FormGroup, InputAdornment, Stack, TextField } from '@mui/material';
import { ABBRECHEN, ANFRAGE_SENDEN, BETRAG, GELD_ANFORDERN, OPTIONAL, SCHLIESSE_MICH_EIN, SUCHE_DOT_DOT_DOT, VERWENDUNGSZWECK, VORSCHLAEGE, WEM_AUSGELEGT } from '../../Common/Internationalization/i18n';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { useSelector } from 'react-redux';
import { RootState } from '../../../Reducer/reducerCombiner';
import {  doPostRequest } from '../../Common/StaticFunctions';

import Typography from '@mui/material/Typography';

// eslint-disable-next-line
import style from './details.module.scss'
import { safeMemberName } from '../../Common/StaticFunctionsTyped';
import UserBox from './UserBox';
import RequestUserItem from './RequestUserItem';
import Cookies from 'js-cookie';
import { format } from 'react-string-format';

type Props = {
    isOpen: boolean,
    close: () => void,
    showConfirmation: () => void,
    member: Member,
    isGroup: boolean
}

const RequestDialog = (props: Props) => {

    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [selectedUser, setselectedUser] = useState({ "name": "", "id": -1 })
    const [selectedUsers, setselectedUsers] = useState<Array<{ "name": string, "id": number }>>([])
    const [search, setsearch] = useState("")
    const [reason, setreason] = useState<string | null>(null)
    const [amount, setamount] = useState(0)
    const [includeUser, setincludeUser] = useState(false)


    useEffect(() => {
        if (selectedUser.id !== -1 && selectedUsers.find((item) => item.id === selectedUser.id) === undefined) {
            setselectedUsers([...selectedUsers, selectedUser])
            setselectedUser({ "name": "", "id": -1 })
        }
    }, [selectedUser,selectedUsers])

    const resetInput = () => {
        setselectedUser({ "name": "", "id": -1 })
        setselectedUsers([])
        setamount(0)
        setreason(null)
    }

    const userSearch = (member: Member) => {
        return member.name.toLowerCase().includes(search.toLowerCase()) ||
            member.alias.toLowerCase().includes(search.toLowerCase())
    }

    const userAmountDivide=(!includeUser?selectedUsers.length:selectedUsers.length+1)

    const filterTransactions = () => {
        const transactions = common.history?.filter(transaction => transaction.memberID === props.member.id).filter(t => {
            return t.description.toLocaleLowerCase().includes("transfer")
        }).splice(0, 5)

        const memberNames: [string, number][] | undefined = common.members?.map(member => [safeMemberName(member), member.id])
        var transactionCount: { [key: string]: [number, number] } = {}
        memberNames?.forEach(member => transactionCount[member[0]] = [member[1], 0])
        transactions?.forEach(t => {
            memberNames?.forEach(m => {
                if (t.description.toLocaleLowerCase().includes(m[0].toLocaleLowerCase())) {
                    transactionCount[m[0]] = [m[1], transactionCount[m[0]][1] + 1]
                }
            })
        })
        // Convert transactionCount to key value pairs
        const transactionCountArray: Array<[string, number, number]> = Object.keys(transactionCount).map((key) => [key, ...transactionCount[key]]);
        // Sort the array based on the second element (high to low)
        transactionCountArray.sort((first, second) => second[2] - first[2]);

        // Return the first 2 elements
        return transactionCountArray.slice(0, 2)
    }

    return (
        <Dialog open={props.isOpen} onClose={props.close} sx={{ zIndex: 20000000 }} >
            <DialogTitle>{GELD_ANFORDERN}</DialogTitle>
            <DialogContent className={style.transferBox}>
                <DialogContentText>
                    {WEM_AUSGELEGT}
                </DialogContentText>
                <TextField
                    label={SUCHE_DOT_DOT_DOT}
                    variant='standard'
                    type='text'
                    value={search}
                    onChange={(value) => { setsearch(value.target.value) }}
                    fullWidth
                />
                {search !== "" ? <><Spacer vertical={15} /><div className={style.recommendationBox}>
                    {common.members?.filter((member) => userSearch(member)).slice(0, 3).map((member) => {
                        return <UserBox name={safeMemberName(member)} onClick={() => {
                            setselectedUser({ "name": safeMemberName(member), "id": member.id });
                            setsearch("")
                        }} />
                    })}
                </div> </> : <></>}

                <Spacer vertical={10} />
                <Typography variant='overline'>
                    {VORSCHLAEGE}
                </Typography>
                <div className={style.recommendationBox}>
                    {filterTransactions().map(transaction => {
                        return <UserBox name={transaction[0]} onClick={() => {
                            setselectedUser({ "name": transaction[0], "id": transaction[1] });
                            setsearch("")
                        }} />
                    })}
                </div>
                <Spacer vertical={10} />
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox value={includeUser} onChange={(value) => { setincludeUser(value.target.checked) }} />}
                        label={SCHLIESSE_MICH_EIN}
                    />
                </FormGroup>
                <Spacer vertical={10} />
                <TextField
                    label={BETRAG}
                    variant='outlined'
                    type='number'
                    onChange={(value) => { setamount(parseFloat(value.target.value)) }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    }}
                />
                <Spacer vertical={15} />
                <TextField
                    label={VERWENDUNGSZWECK}
                    variant='outlined'
                    fullWidth
                    helperText={format("({0})", OPTIONAL)}
                    onChange={(value) => { setreason(value.target.value) }}
                />
                <Spacer vertical={10} />
                <Stack direction="column" alignItems="center" gap={"5px"} className={style.userList}>
                    {selectedUsers.map(user => {
                        return <RequestUserItem
                            name={user.name}
                            amount={amount / userAmountDivide}
                            removeUser={() => {
                                const notRemovedUsers = selectedUsers.filter(userIterator => userIterator.id !== user.id);
                                setselectedUsers([...notRemovedUsers])
                            }} />
                    })}
                </Stack>
                <Spacer vertical={15} />
                <Button
                    disabled={selectedUsers.length === 0 || !(amount > 0)}
                    onClick={() => {
                        const memberID = Cookies.get("memberID");
                        const notUndefinedMemberID = memberID !== undefined ? parseInt(memberID) : 0;

                        resetInput();
                        props.close();
                        props.showConfirmation()

                        const fromUser = selectedUsers.map((user) => user.id);
                        const toUser = notUndefinedMemberID;

                        doPostRequest("users/request/transfer", {
                            'fromUser': fromUser,
                            'toUser': toUser,
                            'amount': amount / userAmountDivide,
                            'description': reason
                        })
                    }}>
                    {ANFRAGE_SENDEN}
                </Button>
                <Button onClick={() => { resetInput(); props.close() }}>{ABBRECHEN}</Button>

            </DialogContent>
        </Dialog>
    )
}

export default RequestDialog