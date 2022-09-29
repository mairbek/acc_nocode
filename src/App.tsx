import * as React from 'react'
import ReactDOM from 'react-dom/client'

import { MultiSelect, Option } from 'react-multi-select-component'

interface Event {
  id: string;
  name: string;
  schema: [string, string][];
}

interface Account {
  id: string;
  address: string;
  params: string[];
}

interface Formula {
  event_id: string;
  address_id: string;
  polarity: string;
  formula: string;
}

const getEvents = (): Event[] => [
  { id: "ev_1", name: "MasterCardFirstPresentment", schema: [["interchange_amount", "$ia"], ["gross_amount", "$ga"]] },
  { id: "ev_3", name: "MastercardChargebackCompletion", schema: [["interchange_amount", "$ia"], ["gross_amount", "$ga"]] },
  { id: "ev_2", name: "StatementTransaction", schema: [["amount", "$amt"], ["customer_account_id", "$cuacc"], ["issuer", "$issuer"], ["is_bnpl_fee", "$is_bnpl"]] },
]

const getAccounts = (): Account[] => [
  { id: "ad_1", address: "liability_payable_settlement_reconciliation_account/$issuer", params: ["$issuer"] },
  { id: "ad_2", address: "settlement_liability_account/$issuer", params: ["$issuer"] },
  { id: "ad_3", address: "interchange_revenue_account/$issuer", params: ["$issuer"] },
  { id: "ad_4", address: "card_receivables_account/$is_bnpl", params: ["$is_bnpl"] },
]

const getFormulas = (): Formula[] => [
  {
    event_id: "ev_1",
    address_id: "ad_1",
    polarity: "debit",
    formula: "$ga"
  },
  {
    event_id: "ev_1",
    address_id: "ad_2",
    polarity: "credit",
    formula: "$ga - $ia"
  },
  {
    event_id: "ev_1",
    address_id: "ad_3",
    polarity: "credit",
    formula: "$ia"
  },
  {
    event_id: "ev_2",
    address_id: "ad_4",
    polarity: "debit",
    formula: "$amt"
  },
  {
    event_id: "ev_2",
    address_id: "ad_1",
    polarity: "credit",
    formula: "$amt"
  },
  {
    event_id: "ev_3",
    address_id: "ad_1",
    polarity: "credit",
    formula: "$ga"
  },
  {
    event_id: "ev_3",
    address_id: "ad_2",
    polarity: "debit",
    formula: "$ga - $ia"
  },
  {
    event_id: "ev_3",
    address_id: "ad_3",
    polarity: "debit",
    formula: "$ia"
  },
]

const filterAccounts = (allAccounts: Account[], events: Event[], formulas: Map<string, Formula>): Account[] => {
  const eventIds = events.map(ev => ev.id)
  let accountIds = new Set<string>()
  formulas.forEach(f => {
    if (eventIds.indexOf(f.event_id) >= 0) {
      accountIds.add(f.address_id)
    }
  });

  const result = allAccounts.filter(acc => accountIds.has(acc.id))
  console.log(result)

  return result
}
interface Cell {
  id: string
  index: number
  account: Account
  debit: string
  credit: string
}

interface Row {
  id: string
  index: number
  event: Event
  cells: Cell[]
}

const computeGrid = (events: Event[], accounts: Account[], formulas: Map<string, Formula>): { rows: Row[] } => {
  let rows: Row[] = []
  let rowIdx = 0
  for (const ev of events) {
    let cells: Cell[] = []
    let cellIdx = 0
    for (const acc of accounts) {
      const key = ev.id + acc.id
      let debit = ""
      let credit = ""
      const f = formulas.get(key)
      if (f !== undefined) {
        if (f.polarity === "debit") {
          debit = f.formula
        }
        if (f.polarity === "credit") {
          credit = f.formula
        }
      }
      cells.push({ id: key, index: cellIdx, account: acc, debit: debit, credit: credit })
      cellIdx++
    }
    rows.push({ id: ev.id, index: rowIdx, event: ev, cells: cells })
    rowIdx++
  }
  return { rows: rows }
}

interface GridProps {
  events: Event[]
  accounts: Account[]

  formulas: Map<string, Formula>
}

const Grid: React.FC<GridProps> = ({ events, accounts, formulas }) => {
  const { rows } = computeGrid(events, accounts, formulas)

  return <>
    <table className="w-full text-sm">
      <thead className="text-xs">
      <tr>
          <th></th>
          {accounts.map(acc => {
            return <>
              <th className='text-middle' colSpan={2}>{acc.address}</th>
            </>
          })}
        </tr>
        <tr>
          <th></th>
          {accounts.map(acc => {
            return <>
              <th className='text-middle'>D</th>
              <th className='text-middle'>C</th>
            </>
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (<>
          <tr key={row.id} className="">
            <td className={"py-4 px-6 dark:border-gray-700"} key={row.id + "_event"}>
              <div className='indent-px'>
                <span className='text-base'>{row.event.name}</span>
                <div className='text-sm'>
                  {row.event.schema.map(
                    ([k, v]: [string, string]) => <p>{k}: <b>{v}</b></p>
                  )}
                </div>
              </div>
            </td>

            {row.cells.map(cell => {
              const background = cell.index % 2 === 0 ? 'bg-gray-100' : '' 
              return (<>
                <td key={cell.id+"_debit"} className={"py-4 px-6 dark:border-gray-700 border-r text-right " + background}>{cell.debit}</td>
                <td key={cell.id+"_credit"} className={"py-4 px-6 dark:border-gray-700 text-left " + background}>{cell.credit}</td>
            </>)})}
          </tr>
        </>))}
      </tbody>
    </table></>
}

function App() {
  const [allEvents] = React.useState<Event[]>(getEvents());

  const eventOptions = allEvents.map<Option>(ev => ({
    value: ev.id,
    label: ev.name
  }))
  const [selected, setSelected] = React.useState<Option[]>(eventOptions);

  const events = allEvents.filter(ev => (selected.map(i => i.value).indexOf(ev.id) >= 0))

  const [allAccounts] = React.useState(getAccounts())
  const [formulas] = React.useState(getFormulas());
  const formulaMap = new Map(formulas.map(f => [f.event_id + f.address_id, f]))
  const accounts = filterAccounts(allAccounts, events, formulaMap)

  return (
    <div className="p-2">
      <Grid events={events} accounts={accounts} formulas={formulaMap}></Grid>
      <MultiSelect
          options={eventOptions}
          value={selected}
          onChange={setSelected}
          labelledBy="Select"
        />
    </div>
  )
}

export default App;
