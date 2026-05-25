import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { Html5Qrcode } from 'html5-qrcode'
import { ABBRECHEN, ERROR_MESSAGE, EVENT_MANUELL, OK } from '../Common/Internationalization/i18n'

type Props = {
    open: boolean,
    title: string,
    onClose: () => void,
    onScanned: (code: string) => void
}

const EventScanDialog = (props: Props) => {
    const { open, onScanned, onClose, title } = props
    const regionId = useMemo(() => `qr-reader-${Math.random().toString(36).slice(2, 10)}`, [])
    const [manualCode, setManualCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const scanningRef = useRef(true)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const isRunningRef = useRef(false)

    useEffect(() => {
        if (!open) {
            return
        }

        setManualCode('')
        setError(null)
        scanningRef.current = true
        let cancelled = false
        let retryTimeout: number | null = null

        const startScanner = () => {
            if (cancelled) {
                return
            }

            const target = document.getElementById(regionId)
            if (!target) {
                retryTimeout = window.setTimeout(startScanner, 50)
                return
            }

            const scanner = new Html5Qrcode(regionId)
            scannerRef.current = scanner
            const startPromise = scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: 240 },
                (decodedText) => {
                    if (!scanningRef.current) {
                        return
                    }
                    scanningRef.current = false
                    if (isRunningRef.current) {
                        isRunningRef.current = false
                        try {
                            scanner.stop().catch(() => { })
                        } catch {
                            // Ignore stop errors when scanner is not running.
                        }
                    }
                    onScanned(decodedText)
                },
                () => { }
            )

            startPromise.then(() => {
                isRunningRef.current = true
            }).catch(() => {
                setError(ERROR_MESSAGE)
            })
        }

        startScanner()

        return () => {
            cancelled = true
            if (retryTimeout !== null) {
                window.clearTimeout(retryTimeout)
            }
            scanningRef.current = false
            if (scannerRef.current) {
                if (isRunningRef.current) {
                    isRunningRef.current = false
                    try {
                        scannerRef.current.stop().catch(() => { })
                    } catch {
                        // Ignore stop errors when scanner is not running.
                    }
                }
                if (typeof (scannerRef.current as any).clear === 'function') {
                    (scannerRef.current as any).clear()
                }
                scannerRef.current = null
            }
        }
    }, [open, onScanned, regionId])

    const submitManual = () => {
        const trimmed = manualCode.trim()
        if (trimmed === '') {
            return
        }
        onScanned(trimmed)
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth keepMounted>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <div id={regionId} style={{ width: '100%' }} />
                {error ? <Typography color="error" variant="body2">{error}</Typography> : <></>}
                <TextField
                    label={EVENT_MANUELL}
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    fullWidth
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{ABBRECHEN}</Button>
                <Button variant="contained" onClick={submitManual}>{OK}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default EventScanDialog
