using {itam as db} from '../db/schema';

@requires: [
    'RepairTechnician',
    'Admin'
]
service RepairService @(path: '/service/repair') {


    @readonly
    entity Me {
        key id         : String;
            firstName  : String;
            lastName   : String;
            email      : String;
            department : String;
    }

    @odata.draft.enabled
    @Capabilities.DeleteRestrictions.Deletable: false
    entity RepairRequests            as
        projection on db.RepairRequest {
            *,
            asset.inventoryNumber as assetInventoryNumber : String,
            asset.name            as assetName            : String,



            virtual null as canStartRepair    : Boolean,
            virtual null as canCompleteRepair : Boolean,
            virtual null as canRejectRepair   : Boolean,
            virtual null as canAddLog         : Boolean
        }
        actions {
            @Core.OperationAvailable: canStartRepair
            action startRepair()                           returns RepairRequests;

            @Core.OperationAvailable: canCompleteRepair
            action completeRepair(resolutionNote: String) returns RepairRequests;

            @Core.OperationAvailable: canRejectRepair
            action rejectRepair(reason: String)           returns RepairRequests;





            @Core.OperationAvailable: canAddLog
            action addLog(note: String)                   returns RepairRequests;
        };



    @readonly
    annotate RepairRequests with @cds.search: {
        description,
        technician,
        assetInventoryNumber,
        assetName,
        requestedBy.firstName,
        requestedBy.lastName
    };

    entity RepairLogs                as projection on db.RepairLog;

    @readonly
    entity Assets                    as projection on db.Asset;

    @readonly
    entity AssetAssignments          as projection on db.AssetAssignment;

    @readonly
    entity AssetNotes                as projection on db.AssetNote;

    @readonly
    entity AssetAvailabilityStatuses as projection on db.AssetAvailabilityStatus;

    @readonly
    entity AssetRepairStatuses       as projection on db.AssetRepairStatus;

    @readonly
    entity RepairRequestStatuses     as projection on db.RepairRequestStatus;

    @readonly
    entity Priorities                as projection on db.Priority;

    @readonly
    entity Employees                 as projection on db.Employee;
}
