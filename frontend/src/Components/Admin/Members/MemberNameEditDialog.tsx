import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { Drink, Member } from '../../../types/ResponseTypes';
import { useDispatch, useSelector } from 'react-redux';
import { AENDERE_NAME_ODER_ALIAS, AENDERN, ALIAS_AENDERN, ALIAS_GEAENDERT, FERTIG, GETRAENK_BEARBEITEN, GETRAENK_BEARBEITEN_BESCHREIBUNG, NAME_GEAENDERT, NUTZERNAME_AENDERN, NUTZERNAME_NICHT_GEAENDERT, NUTZERNAME_NICHT_LEER, NUTZER_AENDERN } from '../../Common/Internationalization/i18n';
import { format } from 'react-string-format';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { RootState } from '../../../Reducer/reducerCombiner';
import style from './memberChange.module.scss'
import Spacer from '../../Common/Spacer';
import { openErrorToast, openToast, setMembers } from '../../../Actions/CommonAction';

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const MemberNameEditDialog = (props: Props) => {
    const common: CommonReducerType = useSelector((state: RootState) => state.common);

    const dispatch = useDispatch()
    const [username, setusername] = useState(props.member.name)
    const [alias, setalias] = useState(props.member.alias)

    useEffect(() => {
        setusername(props.member.name)
        setalias(props.member.alias)
    }, [props.member])


    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>{NUTZER_AENDERN}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {format(AENDERE_NAME_ODER_ALIAS, props.member.name)}
                </DialogContentText>
                <Spacer vertical={30} />
                <div className={style.editDrinkContainer}>
                    <div className={style.editDrinkRow}>
                        <TextField
                            fullWidth
                            label={NUTZERNAME_AENDERN}
                            variant='standard'
                            value={username}
                            onChange={(value) => { setusername(value.target.value) }}
                        />
                        <Button onClick={() => {
                            if (username === "") {
                                dispatch(openToast({
                                    message: NUTZERNAME_NICHT_LEER,
                                    headline: NUTZERNAME_NICHT_GEAENDERT,
                                    type: "error"
                                }))
                                return
                            }

                            doPostRequest(format("users/{0}/name", props.member.id), { name: username }).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: NAME_GEAENDERT }))
                                    doGetRequest("users").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setMembers(value.content))
                                        }
                                    })
                                    props.close()
                                } else {
                                    dispatch(openErrorToast())
                                }
                            })
                        }
                        } variant="contained">
                            {AENDERN}
                        </Button>
                    </div>
                    <div className={style.editDrinkRow}>
                        <TextField
                            fullWidth
                            label={ALIAS_AENDERN}
                            variant='standard'
                            value={alias}
                            onChange={(value) => { setalias(value.target.value) }}
                        />
                        <Button onClick={() =>
                            doPostRequest(format("users/{0}/alias", props.member.id), { alias: alias }).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: ALIAS_GEAENDERT }))
                                    doGetRequest("users").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setMembers(value.content))
                                        }
                                    })
                                    props.close()
                                } else {
                                    dispatch(openErrorToast())
                                }
                            })

                        } variant="contained">
                            {AENDERN}
                        </Button>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{FERTIG}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default MemberNameEditDialog