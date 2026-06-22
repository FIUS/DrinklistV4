import {
    ArrowDownward,
    ArrowUpward,
    Delete,
    Edit,
    Money,
    Person,
    PersonAdd,
    QrCodeScanner,
    Search,
    Visibility,
    VisibilityOff
} from '@mui/icons-material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { format } from 'react-string-format'
import { setMembers } from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { Member } from '../../../types/ResponseTypes'
import EventScanDialog from '../../Event/EventScanDialog'
import {
    EVENT_SCANNEN,
    HINZUFUEGEN,
    KONTO,
    MEMBER_LOESCHEN,
    MITGLIEDER,
    MODIFIZIEREN,
    NAME,
    NUTZER_LEOSCHEN,
    SICHER_X_LOESCHEN,
    SICHTBARKEIT_AENDERN
} from '../../Common/Internationalization/i18n'
import { doGetRequest, doPostRequest, doRequest } from '../../Common/StaticFunctions'
import { calculateAvatarText, formatMoney, parseMoneyInputToCents } from '../../Common/StaticFunctionsTyped'
import WarningPopup from '../../Common/WarningPopup/WarningPopup'
import DialogManager from './DialogManager'
import MemberNameEditDialog from './MemberNameEditDialog'
import style from './member.module.scss'

type SortKey = 'id' | 'name' | 'balance'
type SortConfig = {
    key: SortKey | null,
    direction: 'asc' | 'desc' | null
}

type MetricCardProps = {
    label: string,
    value: string,
    helper?: string,
    icon: React.ReactNode,
    accent?: string
}

const MetricCard = ({ label, value, helper, icon, accent = window.globalTS.ICON_COLOR }: MetricCardProps) => (
    <Paper className={style.metricCard} elevation={1} sx={{ borderTopColor: accent }}>
        <div>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h5" className={style.metricValue}>{value}</Typography>
            {helper ? <Typography variant="body2" color="text.secondary">{helper}</Typography> : null}
        </div>
        <Avatar sx={{ bgcolor: accent }}>{icon}</Avatar>
    </Paper>
)

const MemberAvatar = ({ member, small = false }: { member: Member, small?: boolean }) => {
    const classNames = [
        style.memberAvatar,
        small ? style.smallAvatar : ''
    ].filter(Boolean).join(' ')

    return (
        <Avatar
            className={classNames}
            sx={{ bgcolor: member.hidden ? 'action.disabled' : window.globalTS.ICON_COLOR }}
        >
            {calculateAvatarText(member.alias, member.name)}
        </Avatar>
    )
}

const Members = () => {
    const dispatch = useDispatch()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const common: CommonReducerType = useSelector((state: RootState) => state.common)

    const [name, setName] = useState('')
    const [balance, setBalance] = useState(0)
    const [balanceInput, setBalanceInput] = useState('')
    const [password, setPassword] = useState('')
    const [alias, setAlias] = useState('')
    const [qrScanOpen, setQrScanOpen] = useState(false)
    const [qrScannedCode, setQrScannedCode] = useState<string | null>(null)
    const [qrAlias, setQrAlias] = useState('')
    const [qrBalance, setQrBalance] = useState(0)
    const [qrBalanceInput, setQrBalanceInput] = useState('')
    const [searchName, setSearchName] = useState('')
    const [searchID, setSearchID] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<{ name: string, id: number }>({ name: '', id: -1 })
    const [memberChangeOpen, setMemberChangeOpen] = useState(false)
    const [memberToChange, setMemberToChange] = useState<Member | null>(null)
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })

    const refreshMembers = useCallback(() => {
        return doGetRequest('users').then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })
    }, [dispatch])

    useEffect(() => {
        refreshMembers()
    }, [refreshMembers])

    const totalBalance = useMemo(() => {
        return common.members?.reduce((sum, member) => sum + member.balance, 0) ?? 0
    }, [common.members])

    const hiddenUsers = useMemo(() => {
        return common.members?.filter((member) => member.hidden).length ?? 0
    }, [common.members])

    const lowestBalanceMember = useMemo(() => {
        if (!common.members?.length) {
            return null
        }
        return common.members.reduce((lowest, member) => member.balance < lowest.balance ? member : lowest)
    }, [common.members])

    const filteredAndSortedMembers = useMemo(() => {
        const normalizedSearch = searchName.trim().toLocaleLowerCase()
        const normalizedID = searchID.trim()

        const filtered = (common.members ?? []).filter((member) => {
            const matchesName = normalizedSearch === '' ||
                member.name.toLocaleLowerCase().includes(normalizedSearch) ||
                member.alias.toLocaleLowerCase().includes(normalizedSearch)
            const matchesID = normalizedID === '' || member.id.toString().includes(normalizedID)
            return matchesName && matchesID
        })

        const sortKey = sortConfig.key
        const sortDirection = sortConfig.direction

        return filtered.slice().sort((left, right) => {
            if (!sortKey || !sortDirection) {
                return `${left.name} (${left.alias})`.localeCompare(`${right.name} (${right.alias})`)
            }

            const leftValue = left[sortKey]
            const rightValue = right[sortKey]
            const direction = sortDirection === 'asc' ? 1 : -1

            if (typeof leftValue === 'string' && typeof rightValue === 'string') {
                return leftValue.localeCompare(rightValue) * direction
            }
            return (Number(leftValue) - Number(rightValue)) * direction
        })
    }, [common.members, searchID, searchName, sortConfig])

    const handleSort = (key: SortKey) => {
        setSortConfig((current) => {
            if (current.key !== key) {
                return { key, direction: 'asc' }
            }
            if (current.direction === 'asc') {
                return { key, direction: 'desc' }
            }
            return { key: null, direction: null }
        })
    }

    const renderSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) {
            return null
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUpward fontSize="small" />
            : <ArrowDownward fontSize="small" />
    }

    const openMemberEdit = (member: Member) => {
        setMemberToChange(member)
        setMemberChangeOpen(true)
    }

    const openMemberDelete = (member: Member) => {
        setUserToDelete({ name: member.name, id: member.id })
        setDeleteDialogOpen(true)
    }

    const toggleVisibility = (member: Member) => {
        doPostRequest(`users/${member.id}/visibility/toggle`, '').then((value) => {
            if (value.code === 200) {
                refreshMembers()
            }
        })
    }

    const addMember = () => {
        if (name.trim() === '' || password === '') {
            return
        }

        doPostRequest('users/add', {
            name: name.trim(),
            money: balance,
            password,
            alias: alias.trim()
        }).then((value) => {
            if (value.code === 200) {
                setName('')
                setBalance(0)
                setBalanceInput('')
                setPassword('')
                setAlias('')
                refreshMembers()
            }
        })
    }

    const addQrMember = () => {
        if (!qrScannedCode) {
            return
        }

        doPostRequest('users/add', {
            name: qrScannedCode,
            money: qrBalance,
            password: qrScannedCode,
            alias: qrAlias.trim()
        }).then((value) => {
            if (value.code === 200) {
                setQrScannedCode(null)
                setQrAlias('')
                setQrBalance(0)
                setQrBalanceInput('')
                refreshMembers()
            }
        })
    }

    const memberActions = (member: Member) => (
        <div className={style.memberActions}>
            <DialogManager member={member} />
            <Tooltip title={SICHTBARKEIT_AENDERN}>
                <IconButton onClick={() => toggleVisibility(member)} size="small">
                    {member.hidden ? <VisibilityOff /> : <Visibility />}
                </IconButton>
            </Tooltip>
            <Tooltip title="Name, Alias und Rechte ändern">
                <IconButton onClick={() => openMemberEdit(member)} size="small">
                    <Edit />
                </IconButton>
            </Tooltip>
            <Tooltip title={NUTZER_LEOSCHEN}>
                <IconButton onClick={() => openMemberDelete(member)} size="small" color="error">
                    <Delete />
                </IconButton>
            </Tooltip>
        </div>
    )

    return (
        <main className={style.container}>
            <header className={style.header}>
                <div>
                    <Typography variant="overline" color="text.secondary">Administration</Typography>
                    <Typography variant="h4">{MITGLIEDER}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Konten, Guthaben und Zugänge zentral verwalten
                    </Typography>
                </div>
                <Paper className={style.resultSummary} variant="outlined">
                    <Person color="action" />
                    <div>
                        <Typography variant="caption" color="text.secondary">Aktuelle Auswahl</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {filteredAndSortedMembers.length} von {common.members?.length ?? 0} Mitgliedern
                        </Typography>
                    </div>
                </Paper>
            </header>

            <section className={style.section}>
                <Typography variant="h5">Auf einen Blick</Typography>
                <div className={style.metricGrid}>
                    <MetricCard label="Gesamtguthaben" value={`${formatMoney(totalBalance)} €`} icon={<Money />} />
                    <MetricCard label="Mitglieder" value={`${common.members?.length ?? 0}`} icon={<Person />} />
                    <MetricCard label="Versteckte Nutzer" value={`${hiddenUsers}`} icon={<VisibilityOff />} />
                    <MetricCard
                        label="Niedrigstes Guthaben"
                        value={lowestBalanceMember ? `${formatMoney(lowestBalanceMember.balance)} €` : '–'}
                        helper={lowestBalanceMember?.alias || lowestBalanceMember?.name}
                        icon={<Money />}
                    />
                </div>
            </section>

            <section className={style.section}>
                <div>
                    <Typography variant="h5">Mitglied hinzufügen</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manuell mit Zugangsdaten oder direkt über einen QR-Code
                    </Typography>
                </div>
                <div className={style.createGrid}>
                    <Accordion className={style.createCard} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <div className={style.accordionHeading}>
                                <Avatar sx={{ bgcolor: window.globalTS.ICON_COLOR }}><PersonAdd /></Avatar>
                                <div>
                                    <Typography variant="h6">Manuell anlegen</Typography>
                                    <Typography variant="body2" color="text.secondary">E-Mail, Alias und Passwort vergeben</Typography>
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails className={style.createDetails}>
                            <div className={style.formGrid}>
                                <TextField
                                    label="E-Mail"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    size="small"
                                />
                                <TextField
                                    label="Alias (optional)"
                                    value={alias}
                                    onChange={(event) => setAlias(event.target.value)}
                                    size="small"
                                />
                                <TextField
                                    label="Guthaben"
                                    type="number"
                                    value={balanceInput}
                                    onChange={(event) => {
                                        setBalanceInput(event.target.value)
                                        setBalance(parseMoneyInputToCents(event.target.value))
                                    }}
                                    size="small"
                                />
                                <TextField
                                    label="Passwort"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    size="small"
                                />
                            </div>
                            <Button
                                variant="contained"
                                startIcon={<PersonAdd />}
                                onClick={addMember}
                                disabled={name.trim() === '' || password === ''}
                            >
                                {HINZUFUEGEN}
                            </Button>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion className={style.createCard} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <div className={style.accordionHeading}>
                                <Avatar sx={{ bgcolor: window.globalTS.ICON_COLOR }}><QrCodeScanner /></Avatar>
                                <div>
                                    <Typography variant="h6">Per QR-Code anlegen</Typography>
                                    <Typography variant="body2" color="text.secondary">Code scannen und optional ergänzen</Typography>
                                </div>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails className={style.createDetails}>
                            {!qrScannedCode ? (
                                <Paper className={style.scanPrompt} variant="outlined">
                                    <QrCodeScanner color="action" fontSize="large" />
                                    <Typography variant="body2" color="text.secondary">
                                        Scanne zuerst den QR-Code des neuen Mitglieds.
                                    </Typography>
                                    <Button variant="contained" onClick={() => setQrScanOpen(true)}>
                                        {EVENT_SCANNEN}
                                    </Button>
                                </Paper>
                            ) : (
                                <>
                                    <div className={style.formGrid}>
                                        <TextField label="Code" value={qrScannedCode} size="small" disabled />
                                        <TextField
                                            label="Alias (optional)"
                                            value={qrAlias}
                                            onChange={(event) => setQrAlias(event.target.value)}
                                            size="small"
                                        />
                                        <TextField
                                            label="Guthaben"
                                            type="number"
                                            value={qrBalanceInput}
                                            onChange={(event) => {
                                                setQrBalanceInput(event.target.value)
                                                setQrBalance(parseMoneyInputToCents(event.target.value))
                                            }}
                                            size="small"
                                        />
                                    </div>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        <Button variant="contained" startIcon={<PersonAdd />} onClick={addQrMember}>
                                            {HINZUFUEGEN}
                                        </Button>
                                        <Button variant="text" onClick={() => setQrScannedCode(null)}>
                                            Neu scannen
                                        </Button>
                                    </Stack>
                                </>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </div>
            </section>

            <section className={style.section}>
                <div>
                    <Typography variant="h5">Mitgliederverzeichnis</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Suchen, sortieren und Konten direkt bearbeiten
                    </Typography>
                </div>

                <Paper className={style.directoryCard} elevation={1}>
                    <div className={style.filterBar}>
                        <TextField
                            label="Name oder Alias suchen"
                            value={searchName}
                            onChange={(event) => setSearchName(event.target.value)}
                            size="small"
                            className={style.nameFilter}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            label="ID"
                            value={searchID}
                            onChange={(event) => setSearchID(event.target.value)}
                            size="small"
                            type="number"
                            className={style.idFilter}
                        />
                        {(searchName || searchID) ? (
                            <Button onClick={() => {
                                setSearchName('')
                                setSearchID('')
                            }}>
                                Filter löschen
                            </Button>
                        ) : null}
                    </div>

                    {isMobile ? (
                        <div className={style.memberList}>
                            {filteredAndSortedMembers.map((member) => (
                                <Paper
                                    key={member.id}
                                    className={`${style.memberCard} ${member.hidden ? style.hidden : ''}`}
                                    variant="outlined"
                                >
                                    <div className={style.memberCardHeader}>
                                        <div className={style.memberIdentity}>
                                            <MemberAvatar member={member} />
                                            <div className={style.identityText}>
                                                <Button className={style.memberNameButton} onClick={() => openMemberEdit(member)}>
                                                    {member.alias || member.name}
                                                </Button>
                                                <Typography variant="caption" color="text.secondary">
                                                    {member.alias ? member.name : `Mitglied #${member.id}`}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Chip
                                            size="small"
                                            label={member.hidden ? 'Versteckt' : 'Sichtbar'}
                                            variant={member.hidden ? 'outlined' : 'filled'}
                                        />
                                    </div>
                                    <div className={style.memberBalance}>
                                        <Typography variant="caption" color="text.secondary">{KONTO}</Typography>
                                        <Typography variant="h6">{formatMoney(member.balance)} €</Typography>
                                    </div>
                                    {memberActions(member)}
                                </Paper>
                            ))}
                        </div>
                    ) : (
                        <TableContainer>
                            <Table aria-label="Mitglieder" size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Button className={style.sortButton} onClick={() => handleSort('id')}>
                                                # {renderSortIcon('id')}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button className={style.sortButton} onClick={() => handleSort('name')}>
                                                {NAME} {renderSortIcon('name')}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button className={style.sortButton} onClick={() => handleSort('balance')}>
                                                {KONTO} {renderSortIcon('balance')}
                                            </Button>
                                        </TableCell>
                                        <TableCell align="right">{MODIFIZIEREN}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAndSortedMembers.map((member) => (
                                        <TableRow key={member.id} className={member.hidden ? style.hidden : ''} hover>
                                            <TableCell>{member.id}</TableCell>
                                            <TableCell>
                                                <div className={style.tableIdentity}>
                                                    <MemberAvatar member={member} small />
                                                    <div className={style.identityText}>
                                                        <Button className={style.memberNameButton} onClick={() => openMemberEdit(member)}>
                                                            {member.alias || member.name}
                                                        </Button>
                                                        {member.alias ? (
                                                            <Typography variant="caption" color="text.secondary">{member.name}</Typography>
                                                        ) : null}
                                                    </div>
                                                    {member.hidden ? <Chip label="Versteckt" size="small" variant="outlined" /> : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600}>{formatMoney(member.balance)} €</Typography>
                                            </TableCell>
                                            <TableCell align="right">{memberActions(member)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {filteredAndSortedMembers.length === 0 ? (
                        <div className={style.emptyState}>
                            <Search color="disabled" fontSize="large" />
                            <Typography variant="h6">Keine Mitglieder gefunden</Typography>
                            <Typography variant="body2" color="text.secondary">Passe die Suchfilter an.</Typography>
                        </div>
                    ) : null}
                </Paper>
            </section>

            <EventScanDialog
                open={qrScanOpen}
                title={EVENT_SCANNEN}
                onClose={() => setQrScanOpen(false)}
                onScanned={(code: string) => {
                    setQrScanOpen(false)
                    setQrScannedCode(code)
                }}
            />

            <WarningPopup
                title={MEMBER_LOESCHEN}
                text={format(SICHER_X_LOESCHEN, userToDelete.name)}
                isOpen={deleteDialogOpen}
                close={setDeleteDialogOpen}
                yes={() => {
                    doRequest('DELETE', `users/${userToDelete.id}/delete`, '').then((value) => {
                        if (value.code === 200) {
                            refreshMembers()
                        }
                    })
                }}
                no={() => { }}
            />

            <MemberNameEditDialog
                isOpen={memberChangeOpen}
                close={() => setMemberChangeOpen(false)}
                member={memberToChange ?? {
                    id: 0,
                    name: '',
                    balance: 0,
                    hidden: true,
                    alias: ''
                }}
            />
        </main>
    )
}

export default Members
