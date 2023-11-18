import {
    Aspect,
    Item,
    ItemsQuery,
    Principle,
    SkillsQuery,
    WorkstationQuery,
    Workstation_Slot,
} from "./gql/graphql"

type HasAspect = Workstation_Slot | Item

function getAspects<T extends HasAspect>(datum: T): Aspect[] {
    return "accepts" in datum ? datum.accepts : datum.aspects
}

export function withAspects<D extends HasAspect, T extends { d: D } = { d: D }>(
    data: T[],
): (T & { aspects: Aspect[] })[] {
    return data.map((data) => ({ ...data, aspects: getAspects(data.d) }))
}

type HasPrinciple =
    | SkillsQuery["skill"][number]
    | ItemsQuery["item"][number]
    | WorkstationQuery["workstation"][number]

export function getPrinciples<T extends HasPrinciple>(datum: T): Principle[] {
    if ("primary_principle" in datum) {
        return [datum.primary_principle, datum.secondary_principle]
    }
    if ("principles" in datum) {
        return datum.principles
    }
    return Object.values(Principle).filter((principle) => datum[principle])
}

export function withPrinciples<
    D extends HasPrinciple,
    T extends { d: D } = { d: D },
>(data: T[]): (T & { principles: Principle[] })[] {
    return data.map((data) => ({ ...data, principles: getPrinciples(data.d) }))
}

export function filterPrinciples<T extends HasPrinciple>(
    data: { d: T }[],
    principles: Principle[],
) {
    const principleIds = new Set(principles)
    return withPrinciples(data).filter((item) =>
        item.principles.some((principle) => principleIds.has(principle)),
    )
}

export function filterAspects<
    D extends HasAspect,
    T extends { d: D } = { d: D },
>(data: T[], aspects: Aspect[]) {
    const aspectIds = new Set(aspects.map((aspect) => aspect.id))
    return withAspects(data).filter((item) =>
        item.aspects.some(({ id }) => aspectIds.has(id)),
    )
}
