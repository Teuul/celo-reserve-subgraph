import { AssetAllocationSet} from '../generated/Reserve/Reserve';
import { Event, Field, ArrayField, Item } from '../generated/schema';
import { log, ethereum } from '@graphprotocol/graph-ts';

export function handleAssetAllocationSet(event: AssetAllocationSet): void {
  let event_id = event.transaction.hash.toHex() + "-" + event.transactionLogIndex.toString(); // unique id
  let e = new Event(event_id);
  e.address = event.address.toHex();
  e.type = "AssetAllocationSet";
  e.timestamp = event.block.timestamp;
  createData(event,event_id);
  e.save();
}

export function createData(event: ethereum.Event, event_id: String): void {
  for (let i=0;i<event.parameters.length;i++) {
    if (event.parameters[i].value.kind<7) {
      let field = new Field(event_id + "-" + i.toString());
      field.name = event.parameters[i].name;
      field.event = event_id.toString();
      field.type = getKindString(event.parameters[i].value);
      field.value = getValueString(event.parameters[i].value);
      field.save();
    } else {
      let array = new ArrayField(event_id + '-' + i.toString());
      array.name = event.parameters[i].name;
      array.event = event_id.toString();
      if (event.parameters[i].value.kind==8 || event.parameters[i].value.kind==7) {
        let aux = event.parameters[i].value.toArray();
        for (let j=0;j<aux.length;j++) {
          let item = new Item(event_id + "-" + i.toString() + '-' + j.toString());
          item.type = getKindString(aux[j]);
          item.value = getValueString(aux[j]);
          item.array = array.id;
          item.save();
        }
      } else {
        log.error('__ERROR__: TUPLES NOT HANDLED',[]);
      }
      array.save();
    }
  }
}

export function getKindString(value: ethereum.Value): string {
  switch(value.kind){
    case(0):
      return 'ADDRESS';
    case(1):
      return 'FIXED_BYTES';
    case(2):
      return 'BYTES';
    case(3):
      return 'INT';
    case(4):
      return 'UINT';
    case(5):
      return 'BOOL';
    case(6):
      return 'STRING';
    case(7):
      return 'FIXED_ARRAY'; // not tested
    case(8):
      return 'ARRAY'; // not tested
    case(9):
      return 'TUPLE'; // not tested
    default:
      return 'NONE';
  }
}

export function getValueString(value: ethereum.Value): string {
  switch(value.kind){
    case(0):
      return value.toAddress().toHex().toString();
    case(1):
      return value.toBytes().toString();
    case(2):
      return value.toBytes().toString();
    case(3):
      return value.toBigInt().toString();
    case(4):
      return value.toBigInt().toString();
    case(5):
      if(value.toBoolean()==true)
        return 'true';
      else
        return 'false';
    case(6):
      return value.toString();
    case(7):
      return value.toArray().toString();
    case(8):
      return value.toArray().toString();
    case(9):
      return value.toTuple().toString();
    default:
      return 'NONE';
  }
}