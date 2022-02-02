import React from 'react'
import { Pagination } from 'semantic-ui-react'
export default function Paginator(props) {
    
    function onPageChange(){
    }
    return (
        <div>
            <Pagination totalPages={1} activePage={props.activePage} onPageChange={props.onPageChange} firstItem={null} lastItem={null}>
                
            </Pagination>
        </div>
    )
}
