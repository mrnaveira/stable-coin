//  Copyright 2022. The Tari Project
//
//  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
//  following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
//  disclaimer.
//
//  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
//  following disclaimer in the documentation and/or other materials provided with the distribution.
//
//  3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
//  products derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
//  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
//  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
//  USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import "./Home.css";
import Button from "@mui/material/Button";
import {CircularProgress, MenuItem, Select, TableHead, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import useSettings from "../../store/settings.ts";
import SecondaryHeading from "../../components/SecondaryHeading.tsx";
import {StyledPaper} from "../../components/StyledComponents.ts";
import * as React from "react";
import NewIssuerDialog from "./NewIssuerDialog.tsx";
import useTariProvider from "../../store/provider.ts";
import {NewIssuerParams} from "../../types.ts";
import {Link, useNavigate} from "react-router-dom";
import {TableContainer, Table, TableRow, TableBody, Collapse} from "@mui/material";
import {DataTableCell, AccordionIconButton} from "../../components/StyledComponents";
import type {Instruction} from "@tariproject/typescript-bindings";

function SetTemplateForm() {
    const {settings, setTemplate} = useSettings();

    const [currentSettings, setCurrentSettings] = useState(settings);

    return (
        <>
            <form
                onSubmit={evt => {
                    evt.preventDefault();
                    setTemplate(currentSettings.template);
                }}
            >
                <Grid item xs={12} md={12} lg={12}>
                    <p>1. Set the template ID of the issuer template on the current network</p>
                    <TextField
                        name="template ID"
                        placeholder="Template ID"
                        fullWidth
                        onChange={evt =>
                            setCurrentSettings({
                                ...currentSettings,
                                template: evt.target.value
                            })
                        }
                        value={currentSettings.template || ""}
                    />
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <Button type="submit" disabled={settings.template === currentSettings.template}>
                        Set Template
                    </Button>
                </Grid>
            </form>
        </>
    );
}

function IssuerComponents() {
    const {settings} = useSettings();
    const {provider} = useTariProvider();

    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState(null);
    const [issuerComponents, setIssuerComponents] = useState<object[] | null>(null);

    useEffect(() => {
        if (!isBusy && settings.template && !error && issuerComponents === null) {
            setIsBusy(true);
            provider.listSubstates(settings.template, "Component")
                .then((substates) => {
                    setIssuerComponents(substates.filter((s) => s.template_address === settings.template));
                })
                .catch((e) => setError(e))
                .finally(() => setIsBusy(false));
        }
    }, [isBusy, error, issuerComponents]);

    function handleOnCreate(data: NewIssuerParams) {
        setIsBusy(true);
        provider.createNewIssuer(
            settings.template,
            data,
        )
            .then((result) => {
                // TODO: improve error formatting
                if (result.rejected) {
                    throw new Error(`Transaction rejected: ${JSON.stringify(result.rejected)}`);
                }
                if (result.onlyFeeAccepted) {
                    let [_diff, reason] = result.onlyFeeAccepted;
                    throw new Error(`Transaction rejected (fees charged): ${JSON.stringify(reason)}`);
                }
                // Strict null checking
                if (!result.accept) {
                    throw new Error(`Invariant error: result must be accepted if it is not rejected: ${JSON.stringify(result)}`);
                }

                const diff = result.accept;
                const [_type, id, _val] = diff.up_substates
                    .filter(([type, _id, _val]) => type === "Component")
                    .find(([_type, _id, val]) => val?.template_address === settings.template);
                navigate(`/issuers/${id}`);
            })
            .catch((e) => setError(e))
            .finally(() => setIsBusy(false));
    }

    return (
        <>
            <NewIssuerDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreate={handleOnCreate}
                isBusy={isBusy}
                error={error}
            />
            <Grid item xs={12} md={12} lg={12}>
                <p>2. Create a new issuer component, or select an existing one</p>
                <Button onClick={() => setDialogOpen(true)}>Create New Issuer</Button>
                <br/>
                {issuerComponents ? <IssuerTable data={issuerComponents}/> : <CircularProgress/>}
            </Grid>
        </>
    );
}

function IssuerRow({data}: object) {
    return (
        <>
            <TableRow>
                <DataTableCell width={90} sx={{borderBottom: "none", textAlign: "center"}}>
                    <Link to={`issuers/${data.substate_id.Component}`}>{data.substate_id.Component}</Link>
                </DataTableCell>
                <DataTableCell>{data.module_name}</DataTableCell>
                <DataTableCell>{data.version}</DataTableCell>
            </TableRow>
        </>
    );
}

function IssuerTable({data}: { data: object[] }) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <DataTableCell>Component</DataTableCell>
                        <DataTableCell>Template</DataTableCell>
                        <DataTableCell>Substate Version</DataTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item, key) => <IssuerRow key={key} data={item}/>)}
                </TableBody>
            </Table>
        </TableContainer>
    );
}


function InitialSetup() {
    const {settings} = useSettings();

    return (
        <>
            <Grid item sm={12} md={12} xs={12}>
                <SecondaryHeading>Setup</SecondaryHeading>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
                <StyledPaper>
                    <SetTemplateForm/>
                </StyledPaper>
            </Grid>

            {settings.template && (
                <Grid item xs={12} md={12} lg={12}>
                    <StyledPaper>
                        <IssuerComponents/>
                    </StyledPaper>
                </Grid>
            )}
        </>
    );
}


export default InitialSetup;
