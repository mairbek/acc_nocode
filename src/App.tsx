import * as React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
]

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

// const computeTable = (events: Event[], accounts: Account[], formulas: Map<string, Formula>): { columns: Column[], rows: Row[] } => {
//   const padColumn: Column = { columnId: "pad1", width: 300, resizable: true }

//   const cols: Column[] = [
//     padColumn,
//     ...accounts.flatMap(acc => [{
//       columnId: "col_" + acc.id + "_debit",
//       width: 180
//     }, {
//       columnId: "col_" + acc.id + "_credit",
//       width: 180
//     }
//     ])
//   ];

//   const headerRow: Row = {
//     rowId: 0,
//     cells: [
//       { type: "header", text: "" },
//       ...accounts.flatMap<HeaderCell>(acc => [{ type: "header", text: acc.address, style: { overflow: "visible" } }, { type: "header", text: "" }])
//     ]
//   };

//   let rows: Row[] = [headerRow]
//   for (const ev of events) {
//     let cells: TextCell[] = [{ type: "text", text: ev.name }]
//     for (const acc of accounts) {
//       const key = ev.id + acc.id
//       let debit: TextCell = { type: "text", text: "" }
//       let credit: TextCell = { type: "text", text: "" }
//       const f = formulas.get(key)
//       if (f !== undefined) {
//         if (f.polarity === "debit") {
//           debit = { type: "text", text: "D " + f.formula }
//         }
//         if (f.polarity === "credit") {
//           credit = { type: "text", text: "C " + f.formula }
//         }
//       }
//       cells.push(debit)
//       cells.push(credit)
//     }
//     rows.push({ rowId: ev.id, cells: cells })
//   }
//   return { columns: cols, rows: rows }
// }

const columnHelper = createColumnHelper<any>()

// const padColumn: Column = { columnId: "pad1", width: 300, resizable: true }

//   const cols: Column[] = [
//     padColumn,
//     ...accounts.flatMap(acc => [{
//       columnId: "col_" + acc.id + "_debit",
//       width: 180
//     }, {
//       columnId: "col_" + acc.id + "_credit",
//       width: 180
//     }
//     ])
//   ];


const columns = [
  columnHelper.accessor(row => row["lastName"], {
    id: 'lastName',
    cell: info => info.getValue(),
    header: () => <span>Last Name</span>,
  }),
  // columnHelper.group({
  //     header: 'Info',
  //     footer: props => props.column.id,
  //     columns: [
  //       columnHelper.accessor('age', {
  //         header: () => 'Age',
  //         footer: props => props.column.id,
  //       }),
  //       columnHelper.group({
  //         header: 'More Info',
  //         columns: [
  //           columnHelper.accessor('visits', {
  //             header: () => <span>Visits</span>,
  //             footer: props => props.column.id,
  //           }),
  //           columnHelper.accessor('status', {
  //             header: 'Status',
  //             footer: props => props.column.id,
  //           }),
  //           columnHelper.accessor('progress', {
  //             header: 'Profile Progress',
  //             footer: props => props.column.id,
  //           }),
  //         ],
  //       }),
  //     ],
  //   }),
]

const wrapColumns = (accounts: Account[]): any[] => (
  [
    columnHelper.accessor("_event", {
      header: () => '',
      cell: info => info.getValue(),
    }),
    ...accounts.map(acc => 
      columnHelper.group({
        header: acc.address,
        columns: [
          columnHelper.accessor(acc.id + "_debit", {
            header: () => 'D',
            cell: info => info.getValue(),
          }),
          columnHelper.accessor(acc.id + "_credit", {
            header: () => 'C',
            cell: info => info.getValue(),
          }),
          ]
        })
    )
  ]
)

const computeGrid = (events: Event[], accounts: Account[], formulas: Map<string, Formula>): { rows: any[] } => {
  let rows: any[] = []
  for (const ev of events) {
    let row: Record<string, string> = {}
    row["_event"] = ev.name
    for (const acc of accounts) {
      const key = ev.id + acc.id
      let debit = ""
      let credit = ""
      const f = formulas.get(key)
      if (f !== undefined) {
        if (f.polarity === "debit") {
          debit = "D " + f.formula
        }
        if (f.polarity === "credit") {
          credit = "D " + f.formula
        }
      }
      row[acc.id + "_debit"] = debit
      row[acc.id + "_credit"] = credit
    }
    rows.push(row)
  }
  return { rows: rows }
}

function App() {
  const [allEvents] = React.useState<Event[]>(getEvents());
  // TODO implement filtering
  const events = allEvents.filter(ev => true)
  const [allAccounts] = React.useState(getAccounts())
  const [formulas] = React.useState(getFormulas());
  const formulaMap = new Map(formulas.map(f => [f.event_id + f.address_id, f]))
  const accounts = filterAccounts(allAccounts, events, formulaMap)

  const { rows } = computeGrid(events, accounts, formulaMap)
  const wc = wrapColumns(accounts)
  // const [data, setData] = React.useState(() => [...defaultData])
  const rerender = React.useReducer(() => ({}), {})[1]
  const data = rows
  const table = useReactTable({
    data: data,
    columns: wc,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-4" />
      <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button>
    </div>
  )
}

export default App;
