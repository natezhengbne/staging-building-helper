export enum ComponentEvent {
	ClearAll = "event.clearAll",
}

export const gerritProjectJenkinsImageFieldNameMapping: { [project: string]: string } =
	{
		"admin-ui": "ADMIN_UI_IMAGE_TAG",
		"bulk-import": "BULK_IMPORT_IMAGE_TAG",
		"client-cms-2": "CLIENT_CMS_IMAGE_TAG",
		"consul-config": "CONSUL_CONFIG_IMAGE_TAG",
		"connectid-rp-connector": "CONNECTID_RP_CONNECTOR_IMAGE_TAG",
		"config-api": "CONFIG_API_IMAGE_TAG",
		"customer-verify": "CUSTOMER_VERIFY_IMAGE_TAG",
		emailcms: "EMAILCMS_IMAGE_TAG",
		emailrelay: "EMAILREPAY_IMAGE_TAG",
		hermes: "HERMES_IMAGE_TAG",
		jl: "JL_IMAGE_TAG",
		"jl-db-update": "JL_DB_UPDATE_IMAGE_TAG",
		"cp-kafka": "KAFKA_IMAGE_TAG",
		"kafka-topics": "KAFKA_TOPICS_IMAGE_TAG",
		"msg-filestore": "MSG_FILESTORE_IMAGE_TAG",
		ruth: "RUTH_IMAGE_TAG",
		webui: "WEBUI_IMAGE_TAG",
	};