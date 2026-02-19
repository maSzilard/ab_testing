/**
 * VWO A/B Test: Post-Type Column Removal and Product Filtering
 * Production Version - Minified and Optimized for VWO
 * 
 * This script removes the post-type column from the product table and hides
 * all products except those with "intermediate" post-type values.
 * 
 * USAGE IN VWO:
 * 1. Copy this entire script
 * 2. Paste it into VWO's "Custom JavaScript" section for your variation
 * 3. The script will run automatically when the page loads
 * 
 * WHAT IT DOES:
 * - Removes "Post Type" column from the product table
 * - Hides all products except those with "Intermediate" post-type
 * - Updates filter counts and maintains table functionality
 * - Integrates seamlessly with existing filtering system
 */

(function(){
'use strict';

// Configuration
const c={
    attr:'post-type',
    keep:'intermediate',
    table:'table.which-mesh-category',
    header:'thead tr:first-child',
    filter:'#aira_ajax_filters',
    rows:'#aira_ajax_products .table_string',
    debug:false
};

// Utilities
const u={
    log:(m,d)=>{if(c.debug)console.log('[VWO Post-Type Filter]',m,d||'')},
    $:(s)=>document.querySelector(s),
    $$:(s)=>document.querySelectorAll(s),
    hide:(e)=>{if(e)e.style.display='none'},
    has:(e,t)=>e&&e.textContent&&e.textContent.toLowerCase().includes(t.toLowerCase())
};

// Main filter object
const f={
    // Find post-type column index
    findCol:()=>{
        u.log('Finding post-type column...');
        const h=u.$(c.header);
        if(!h)return-1;
        const hs=h.querySelectorAll('th');
        let idx=-1;
        hs.forEach((th,i)=>{
            const txt=th.textContent.toLowerCase();
            if(txt.includes('post')&&txt.includes('type')){
                idx=i;
                u.log('Found at index:',i);
            }
        });
        return idx;
    },

    // Remove column header
    removeHeader:(idx)=>{
        const h=u.$(c.header);
        if(!h)return false;
        const hs=h.querySelectorAll('th');
        if(hs[idx]){
            u.hide(hs[idx]);
            u.log('Header hidden');
            return true;
        }
        return false;
    },

    // Remove filter dropdown
    removeFilter:(idx)=>{
        const fr=u.$(c.filter);
        if(!fr)return false;
        const fcs=fr.querySelectorAll('td');
        if(fcs[idx]){
            u.hide(fcs[idx]);
            u.log('Filter hidden');
            return true;
        }
        return false;
    },

    // Hide data cells
    hideCells:(idx)=>{
        const rows=u.$$(c.rows);
        let count=0;
        rows.forEach(row=>{
            const cells=row.querySelectorAll('td');
            if(cells[idx]){
                u.hide(cells[idx]);
                count++;
            }
        });
        u.log(`Hidden ${count} cells`);
        return count>0;
    },

    // Check if row has intermediate value
    hasIntermediate:(row,idx)=>{
        const cells=row.querySelectorAll('td');
        if(!cells[idx])return false;
        const txt=cells[idx].textContent.trim().toLowerCase();
        return txt===c.keep.toLowerCase();
    },

    // Filter products
    filterProducts:(idx)=>{
        u.log('Filtering products...');
        const rows=u.$$(c.rows);
        let hidden=0,visible=0;
        rows.forEach(row=>{
            if(row.classList.contains('gabion-banner-row'))return;
            if(!f.hasIntermediate(row,idx)){
                row.classList.add('hide');
                hidden++;
            }else{
                row.classList.remove('hide');
                visible++;
            }
        });
        u.log(`Hidden: ${hidden}, Visible: ${visible}`);
        return{hidden,visible};
    },

    // Update banner colspan
    updateBanner:()=>{
        const banners=u.$$('.gabion-banner-row-td');
        banners.forEach(cell=>{
            const curr=parseInt(cell.getAttribute('colspan')||'1');
            const newSpan=Math.max(1,curr-1);
            cell.setAttribute('colspan',newSpan.toString());
        });
    },

    // Update filter counts
    updateCounts:()=>{
        const selects=u.$$('select.attr_filters_category');
        selects.forEach(select=>{
            const slug=select.getAttribute('data-attr_slug');
            if(slug===c.attr)return;
            const options=select.querySelectorAll('option');
            options.forEach(option=>{
                const val=option.value;
                if(val!==''){
                    const visRows=u.$$('.table_string:not(.hide):not(.gabion-banner-row)');
                    let count=0;
                    visRows.forEach(row=>{
                        if(row.classList.contains(val))count++;
                    });
                    const name=option.textContent.replace(/\s*\(\d+\)$/,'');
                    option.textContent=`${name} (${count})`;
                    option.disabled=count===0;
                }
            });
        });
    },

    // Reapply striping
    stripe:()=>{
        const rows=u.$$('.table_string');
        rows.forEach(row=>{
            row.classList.remove('odd-visible','even-visible');
        });
        let idx=0;
        const visRows=u.$$('.table_string:not(.hide):not(.gabion-banner-row)');
        visRows.forEach(row=>{
            row.classList.add(idx%2===0?'odd-visible':'even-visible');
            idx++;
        });
    },

    // Update system
    updateSystem:()=>{
        setTimeout(()=>{
            try{
                f.updateCounts();
                f.stripe();
                f.updateBanner();
                u.log('System updated');
            }catch(e){
                u.log('Update error:',e);
            }
        },100);
    },

    // Main execution
    exec:()=>{
        u.log('Starting execution...');
        const table=u.$(c.table);
        if(!table){
            u.log('Table not found, retrying...');
            setTimeout(()=>f.exec(),500);
            return;
        }
        const idx=f.findCol();
        if(idx===-1){
            u.log('Post-type column not found');
            return;
        }
        if(!f.removeHeader(idx))return;
        f.removeFilter(idx);
        f.hideCells(idx);
        const result=f.filterProducts(idx);
        if(result.visible===0){
            u.log('Warning: No intermediate products found!');
        }
        f.updateSystem();
        u.log('Execution completed');
    }
};

// VWO integration
const vwo={
    isVWO:()=>typeof window._vwo_code!=='undefined'||typeof window.VWO!=='undefined'||window.location.search.includes('vwo_')||document.querySelector('script[src*="vwo"]')!==null,
    
    wait:(cb,max=50)=>{
        let attempts=0;
        const check=()=>{
            attempts++;
            if(vwo.isVWO()||attempts>=max){
                u.log(`VWO ready after ${attempts} attempts`);
                cb();
            }else{
                setTimeout(check,100);
            }
        };
        check();
    },

    exec:()=>{
        u.log('VWO Post-Type Filter initializing...');
        if(vwo.isVWO()){
            u.log('VWO environment detected');
            try{
                if(window.VWO&&window.VWO.push){
                    window.VWO.push(['track.event','post_type_filter_applied']);
                }
            }catch(e){
                u.log('VWO tracking error:',e);
            }
        }
        f.exec();
    }
};

// Initialize
const init=()=>{
    setTimeout(()=>{
        if(document.readyState==='loading'){
            document.addEventListener('DOMContentLoaded',()=>{
                vwo.wait(()=>vwo.exec());
            });
        }else{
            vwo.wait(()=>vwo.exec());
        }
    },200);
};

init();

})();




