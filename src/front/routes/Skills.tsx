import { useQuery } from "urql"
import axios from "axios"
import { useReducer, useState } from "react"

import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Dialog from "@mui/material/Dialog"
import { DialogActions, DialogContent } from "@mui/material"
import TextField from "@mui/material/TextField"

import { PrincipleCard } from "../routes/Principles"
import { graphql } from "../gql"
import * as types from "../gql/graphql"

const API_URL = "http://localhost:8000"

const skillQueryDocument = graphql(`
    query Skills {
        skill {
            id
            level
            primary_principle {
                id
            }
            secondary_principle {
                id
            }
        }
    }
`)

function skillReducer(
    state: types.SkillsQuery["skill"],
    action: { type: "increment"; skill: types.Skill["id"] },
): types.SkillsQuery["skill"] {
    switch (action.type) {
        case "increment": {
            return state.map((skill) => {
                if (skill.id !== action.skill) return skill
                return {
                    ...skill,
                    level: skill.level + 1,
                }
            })
        }
    }
}

interface SkillProps extends types.Skill {
    onIncrement(): void
}

function Skill(props: SkillProps) {
    // TODO: move into reducer
    const [skill, setSkill] = useState(props)

    async function upgradeSkill() {
        const response = await axios.patch(`${API_URL}/skill/${props.id}`, {
            level: props.level + 1,
        })
        setSkill(response.data)
        props.onIncrement()
    }

    return (
        <Card key={skill.id}>
            <CardHeader title={skill.id} />
            <CardContent sx={{ display: "inline-flex" }}>
                <PrincipleCard
                    key={skill.primary_principle!.id}
                    id={skill.primary_principle!.id}
                    title={skill.level + 1}
                />
                <PrincipleCard
                    key={skill.secondary_principle!.id}
                    id={skill.secondary_principle!.id}
                    title={skill.level}
                />
            </CardContent>
            <CardActions>
                <Button onClick={upgradeSkill}>Upgrade Skill</Button>
            </CardActions>
        </Card>
    )
}

const SkillsView = () => {
    // TODO: move into reducer
    const [{ data }] = useQuery({ query: skillQueryDocument })

    const [state, dispatch] = useReducer(skillReducer, data!.skill)

    const [open, setOpen] = useState(false)
    const [newSkill, setNewSkill] = useState("")

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleSkillIncrement = (skill: types.Skill["id"]) => {
        dispatch({ type: "increment", skill })
    }
    const handleNewSkill = (event, value: string) => {
        setNewSkill(value)
    }
    // TODO: move into reducer
    function learnSkill() {
        axios.patch(`${API_URL}/skill/${newSkill}`, { level: 1 }).then(() => {
            dispatch({ type: "increment", skill: newSkill })
            setOpen(false)
        })
    }

    return (
        <Box
            sx={{
                maxWidth: "450px",
                marginBlock: 1,
                marginInline: "auto",
                display: "flex",
                flexDirection: "column",
                rowGap: 1,
            }}
        >
            <Button onClick={handleClickOpen}>Learn new Skill</Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <Autocomplete
                        id="skill-selector"
                        options={state
                            .filter(({ level }) => level == 0)
                            .map((s) => s.id)}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                            <TextField {...params} label="Skill" />
                        )}
                        onChange={handleNewSkill}
                    />
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={learnSkill}>Learn</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            {state
                .filter(({ level }) => level > 0)
                .map(({ ...skill }) => (
                    <Skill
                        key={skill.id}
                        onIncrement={() => handleSkillIncrement(skill.id)}
                        {...skill}
                    />
                ))}
        </Box>
    )
}

export default SkillsView
